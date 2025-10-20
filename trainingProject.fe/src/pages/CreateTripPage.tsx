import { useState } from "react";
import CoordinatePicker, {
  type LatLng,
} from "../components/CoordinatePicker.tsx";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

export default function CreateTripPage() {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<Image[]>([]);
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  type Image = { image: File; description: string; Date: string };
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  type CordsData = {
    startCords: LatLng | null;
    endCords: LatLng | null;
  };

  type ImageDto = {
    ImageFile: string;
    Description: string;
    UserId: string;
    Date: string;
  };

  type CalculatetRoute = { distance: number; duration: number };
  const [calculatedRoute, setCalculatedRoute] =
    useState<CalculatetRoute | null>(null);
  const [tripCords, setTripCords] = useState<CordsData>({
    startCords: null,
    endCords: null,
  });

  const addImage = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFilesArray = Array.from(fileList);

    const newImageObjects = newFilesArray.map((file) => {
      return {
        image: file,
        description: "",
        Date: new Date().toISOString(),
      } as Image;
    });

    setImages((prevImages) => [...prevImages, ...newImageObjects]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imagePromises: Promise<ImageDto>[] = images.map((image) => {
      const base64Promise = fileToBase64(image.image);

      return base64Promise.then((base64String) => {
        return {
          ImageFile: base64String,
          Description: image.description,
        } as ImageDto;
      });
    });

    const imageDtos: ImageDto[] = await Promise.all(imagePromises);

    const newTrip = {
      StartCoordinates: {
        Latitude: tripCords.startCords?.lat.toString() ?? "0",
        Longitude: tripCords.startCords?.lng.toString() ?? "0",
      },
      EndCoordinates: {
        Latitude: tripCords.endCords?.lat.toString() ?? "0",
        Longitude: tripCords.endCords?.lng.toString() ?? "0",
      },
      TripName: tripName,
      Images: imageDtos,
      Restaurants: [],
      Distance: calculatedRoute?.distance ?? 0,
      Elevation: 10,
      Description: description,
    };

    const response = await fetch("http://localhost:5065/Trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTrip),
      credentials: "include",
    });

    if (response.ok) {
      navigate("/trips");
    } else {
      setError(true);
    }
  };

  const handleDeleteImage = () => {
    if (selectedIndex === null) return;

    setImages((prevImages) => prevImages.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;

    setImages((prevImages) =>
      prevImages.map((img, i) => {
        if (i === selectedIndex) {
          return { ...img, description: newDescription };
        }
        return img;
      })
    );
  };

  const handleRouteCalculated = (distance: number, duration: number) => {
    setCalculatedRoute({
      distance: distance,
      duration: duration,
    });
  };

  const handleCords = (startCords: LatLng | null, endCords: LatLng | null) => {
    setTripCords({
      startCords: startCords,
      endCords: endCords,
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };

      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="min-h-full bg-[color:var(--color-background)] p-6 text-[color:var(--color-foreground)]">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Create your next Trip
          </h1>
          <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">
            Plan your journey by selecting coordinates, adding images, and
            providing details.
          </p>
        </div>
        <Button type="submit" form="trip-form" size="lg">
          Create Trip
        </Button>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-[color:color-mix(in srgb,var(--color-error) 10%,transparent)] border border-[color:var(--color-error)] rounded-lg">
          <p className="text-[color:var(--color-error)] font-medium">
            Unable to create your trip. Please try again.
          </p>
        </div>
      )}

      <form id="trip-form" onSubmit={handleSubmit} className="w-full space-y-6">
        <div className="bg-[color:var(--color-primary)] p-6 rounded-2xl shadow-lg border border-[color:var(--color-muted)]">
          <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
            Trip Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tripName">Trip Name *</Label>
              <Input
                id="tripName"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Walking to the clouds"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Trip Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The destination is above the clouds"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col bg-[color:var(--color-primary)] p-6 rounded-2xl shadow-lg border border-[color:var(--color-muted)]">
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
              Trip Images
            </h2>

            <div className="space-y-2 mb-4">
              <Label htmlFor="images">Add Images</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => addImage(e.target.files)}
              />
              <p className="text-xs text-[color:var(--color-muted-foreground)]">
                Upload multiple images of your trip
              </p>
            </div>

            {images.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto pr-2 max-h-80 mb-4">
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((file, index) => (
                      <div
                        key={index}
                        className={`relative group aspect-square overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
                          selectedIndex === index
                            ? "ring-4 ring-[color:var(--color-accent)] scale-105"
                            : "hover:ring-2 hover:ring-[color:var(--color-muted)] hover:scale-105"
                        }`}
                        onClick={() => setSelectedIndex(index)}
                      >
                        <img
                          src={URL.createObjectURL(file.image)}
                          alt={`Trip Image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        {selectedIndex === index && (
                          <div className="absolute inset-0 bg-[color:color-mix(in srgb,var(--color-accent) 20%,transparent)] flex items-center justify-center">
                            <span className="text-[color:var(--color-primary-foreground)] text-xs font-medium">
                              Selected
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedIndex !== null ? (
                  <div className="p-4 bg-[color:color-mix(in srgb,var(--color-muted) 50%,transparent)] border border-[color:var(--color-muted)] rounded-xl space-y-3">
                    <h3 className="text-sm font-semibold text-[color:var(--color-foreground)]">
                      Edit Image Details
                    </h3>
                    <div className="space-y-2">
                      <Label htmlFor="imageDescription">
                        Image Description
                      </Label>
                      <Input
                        id="imageDescription"
                        type="text"
                        placeholder="Add image description..."
                        value={images[selectedIndex]?.description || ""}
                        onChange={handleDescriptionChange}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={handleDeleteImage}
                    >
                      Delete Image
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 bg-[color:color-mix(in srgb,var(--color-muted) 30%,transparent)] border border-dashed border-[color:var(--color-muted)] rounded-xl text-center">
                    <p className="text-sm text-[color:var(--color-muted-foreground)]">
                      Select an image to add a description or delete it
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 border-2 border-dashed border-[color:var(--color-muted)] rounded-xl">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-[color:var(--color-muted-foreground)]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
                    No images uploaded yet
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col bg-[color:var(--color-primary)] p-6 rounded-2xl shadow-lg border border-[color:var(--color-muted)]">
            <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
              Trip Route
            </h2>
            <CoordinatePicker
              title="Pin your Trip"
              onRouteCalculated={handleRouteCalculated}
              onCoordinatesChange={handleCords}
            />
            {calculatedRoute && (
              <div className="mt-4 p-4 bg-[color:color-mix(in srgb,var(--color-muted) 30%,transparent)] rounded-lg">
                <p className="text-sm text-[color:var(--color-muted-foreground)]">
                  Distance:{" "}
                  <span className="font-semibold text-[color:var(--color-foreground)]">
                    {(calculatedRoute.distance / 1000).toFixed(2)} km
                  </span>
                </p>
                <p className="text-sm text-[color:var(--color-muted-foreground)] mt-1">
                  Duration:{" "}
                  <span className="font-semibold text-[color:var(--color-foreground)]">
                    {Math.round(calculatedRoute.duration / 60)} min
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
