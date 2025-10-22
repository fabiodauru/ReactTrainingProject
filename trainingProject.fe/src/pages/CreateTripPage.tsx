import { useState } from "react";
import CoordinatePicker, {
  type LatLng,
} from "../components/CoordinatePicker.tsx";
import { useNavigate } from "react-router-dom";
import ImagePicker, { type Image } from "../components/ImagePicker.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

export default function CreateTripPage(){
    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    
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
    
    type CalculatetRoute = {distance: number, duration: number};
    const [calculatedRoute, setCalculatedRoute] = useState<CalculatetRoute | null>(null);
    const [tripCords, setTripCords] = useState<CordsData>({ startCords: null, endCords: null });
    
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

    const response = await fetch("http://localhost:5065/api/Trips", {
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

                <ImagePicker
                    images={images}
                    setImages={setImages}
                />


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
            </form>
        </div>
    );
}
