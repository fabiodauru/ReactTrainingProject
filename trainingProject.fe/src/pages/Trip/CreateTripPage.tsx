import { useEffect, useState } from "react";
import CoordinatePicker from "@/components/commons/CoordinatePicker";
import { useNavigate } from "react-router-dom";
import ImagePicker from "@/components/commons/ImagePicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/api";
import { cn, fileToBase64 } from "@/lib/utils";
import type {
  Trip,
  LatLng,
  CordsData,
  Image,
  ImageWithFile,
  RestaurantDto,
} from "@/lib/type";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateTripPage() {
  const [tripName, setTripName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImageWithFile[]>([]);
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [closestRestaurants, setClosestRestaurants] = useState<RestaurantDto[]>(
    []
  );
  const [isFetchingRestaurants, setIsFetchingRestaurants] = useState(false);

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<
    string | undefined
  >(undefined);

  type CalculatetRoute = { distance: number; duration: number };
  const [calculatedRoute, setCalculatedRoute] =
    useState<CalculatetRoute | null>(null);
  const [tripCords, setTripCords] = useState<CordsData>({
    startCords: null,
    endCords: null,
  });
  type SliderProps = React.ComponentProps<typeof Slider>;
  type SelectedRestaurant = RestaurantDto & { userBeerScore: number };
  const [selectedRestaurants, setSelectedRestaurants] = useState<
      SelectedRestaurant[]
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageDtos: Image[] = await Promise.all(
      images.map(async (img) => ({
        imageFile: await fileToBase64(img.image),
        description: img.description,
      }))
    );

    const newTrip = {
      StartCoordinates: {
        Latitude: tripCords.startCords?.lat ?? "0",
        Longitude: tripCords.startCords?.lng ?? "0",
      },
      EndCoordinates: {
        Latitude: tripCords.endCords?.lat ?? "0",
        Longitude: tripCords.endCords?.lng ?? "0",
      },
      TripName: tripName,
      Images: imageDtos,
      Restaurants: [],
      Distance: calculatedRoute?.distance ?? 0,
      Elevation: 10,
      Description: description,
    };

    try {
      await api.post<Trip>(`${ENDPOINTS.TRIP.CREATE}`, newTrip);
      navigate("/trips");
    } catch (err) {
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

  function BeerSlider({ className, ...props }: SliderProps) {
    return (
      <Slider
        defaultValue={[7]}
        max={10}
        step={1}
        className={cn("w-[100%]", className)}
        {...props}
      />
    );
  }
  const handleAddRestaurant = (val: string | undefined) => {
    if (!val) {
      setSelectedRestaurantId(undefined);
      return;
    }
    
    setSelectedRestaurantId(val);
    
    const found = closestRestaurants.find((r) => r.id === val);
    if (!found) {
      return;
    }
    
    setSelectedRestaurants((prev) => {
      if (prev.some((sr) => sr.id === found.id)) {
        return prev;
      }
      const defaultScore =
          typeof found.beerScoreAverage === "number"
              ? Math.round(found.beerScoreAverage)
              : 7;
      return [...prev, { ...found, userBeerScore: defaultScore }];
    });
    
    setSelectedRestaurantId(undefined);
  };
  
  const handleRemoveRestaurant = (id: string) => {
    setSelectedRestaurants((prev) => prev.filter((r) => r.id !== id));
  };
  
  const renderRestaurantImage = (restaurant: SelectedRestaurant) => {
    const imageUrl =
        (restaurant.images as string | undefined) ||
        (restaurant.images && restaurant.images.length > 0 ?
            restaurant.images[0]
            : undefined);

    if (imageUrl) {
      return (
          <img
              src={`data:image/jpeg;base64,${imageUrl}`}
              alt={restaurant.restaurantName}
              className="w-full h-28 object-cover rounded-lg"
          />
      );
    }

    return (
        <div className="w-full h-28 bg-[color:color-mix(in srgb,var(--color-muted) 20%,transparent)] rounded-lg flex items-center justify-center text-xs text-[color:var(--color-muted-foreground)]">
          No image
        </div>
    );
  };
  
  const handleBeerScoreCommit = (restaurantId: string, val: number[] | number) => {
    const score = Array.isArray(val) ? val[0] : val;
    setSelectedRestaurants((prev) =>
        prev.map((r) => (r.id === restaurantId ? { ...r, userBeerScore: score } : r))
    );
  };

  useEffect(() => {
    const { startCords, endCords } = tripCords;

    if (startCords && endCords) {
      fetchClosestRestaurants(startCords, endCords);
    } else {
      setClosestRestaurants([]);
      setSelectedRestaurantId(undefined);
      setSelectedRestaurants([]);
    }
  }, [tripCords]);

  useEffect(() => {
    const { startCords, endCords } = tripCords;

    if (startCords && endCords) {
      fetchClosestRestaurants(startCords, endCords);
    } else {
      setClosestRestaurants([]);
      setSelectedRestaurantId(undefined);
    }
  }, [tripCords]);

  const fetchClosestRestaurants = async (
    startCords: LatLng,
    endCords: LatLng
  ) => {
    setIsFetchingRestaurants(true);
    const queryParams = new URLSearchParams({
      "Start.Latitude": String(startCords.lat),
      "Start.Longitude": String(startCords.lng),
      "End.Latitude": String(endCords.lat),
      "End.Longitude": String(endCords.lng),
    }).toString();

    const endpoint = `${ENDPOINTS.RESTAURANT.CLOSEST}?${queryParams}`;

    try {
      const data = await api.get<{
        message: number;
        result?: { results: RestaurantDto[] };
      }>(endpoint);

      if (data.message === 2 && data.result?.results) {
        setClosestRestaurants(data.result.results);
        if (!selectedRestaurantId && data.result.results.length > 0) {
          setSelectedRestaurantId(data.result.results[0].id);
        }
      } else {
        console.error("Backend did not return success:", data.message);
        setClosestRestaurants([]);
      }
    } catch (error) {
      console.error("Failed to fetch closest restaurants:", error);
      setClosestRestaurants([]);
    } finally {
      setIsFetchingRestaurants(false);
    }
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
              <Label htmlFor="tripName" className={"pl-3"}>
                Trip Name
              </Label>
              <Input
                id="tripName"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="Walking to the clouds"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className={"pl-3"}>
                Trip Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="The destination is above the clouds"
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w flex flex-col">
          <CoordinatePicker
            title="Pin your Trip"
            onRouteCalculated={handleRouteCalculated}
            onCoordinatesChange={handleCords}
          />

          {calculatedRoute && (
            <div className="min-w-full flex items-center justify-between p-4 bg-[color:color-mix(in srgb,var(--color-muted) 30%,transparent)] rounded-lg">
              <p className="text-sm text-[color:var(--color-muted-foreground]">
                Distance:{" "}
                <span className="font-semibold text-[color:var(--color-foreground)]">
                  {(calculatedRoute.distance / 1000).toFixed(2)} km
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col bg-[color:var(--color-primary)] p-6 rounded-2xl shadow-lg border border-[color:var(--color-muted)]">
          <h2 className="text-lg font-semibold text-[color:var(--color-foreground)] mb-4">
            Extras
          </h2>

          <div className="flex flex-col md:flex-row gap-6">
            <ImagePicker images={images} setImages={setImages} />

            <div className="w-full md:w-1/2 flex flex-col border border-[color:var(--color-muted)] rounded-lg">
              <h3 className="text-md font-semibold text-[color:var(--color-foreground)] mb-3 mt-3">
                Select restaurants
              </h3>

              <div className="flex flex-col gap-4 p-3 border-b border-[color:var(--color-muted)] mb-4">
                <div>
                  <label
                      htmlFor="restaurant-select"
                      className="block text-sm font-medium text-[color:var(--color-muted-foreground)] mb-1"
                  >
                    Add a Restaurant to your Trip
                  </label>
                  <Select
                      value={selectedRestaurantId}
                      onValueChange={(val) => handleAddRestaurant(val)}
                  >
                    <SelectTrigger
                        aria-label="Select restaurant"
                        className="w-full"
                        aria-disabled={isFetchingRestaurants}
                    >
                      <SelectValue
                          placeholder={
                            isFetchingRestaurants
                                ? "Loading closest restaurants..."
                                : closestRestaurants.length === 0
                                    ? "No restaurants found nearby. Pin your trip coordinates!"
                                    : "Select a restaurant"
                          }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Restaurants</SelectLabel>
                        {closestRestaurants
                            .filter(
                                (r) => !selectedRestaurants.some((sr) => sr.id === r.id)
                            )
                            .map((restaurant: RestaurantDto) => (
                                <SelectItem key={restaurant.id} value={restaurant.id}>
                                  {restaurant.restaurantName} --- BeerScore:{" "}
                                  {restaurant.beerScoreAverage}
                                </SelectItem>
                            ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                {selectedRestaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        className="p-4 border border-[color:var(--color-muted)] rounded-xl bg-[color:color-mix(in srgb,var(--color-primary) 5%,transparent)]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold text-[color:var(--color-foreground)]">
                          {restaurant.restaurantName}
                        </h4>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveRestaurant(restaurant.id)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="flex space-x-4">
                        <div className="flex-shrink-0 w-40">
                          {renderRestaurantImage(restaurant)}
                        </div>

                        <div className="flex-grow min-w-0">
                          <p className="text-sm text-[color:var(--color-muted-foreground)] mb-3">
                            Avg. Beer Score:{" "}
                            <span className="font-semibold">
                            {restaurant.beerScoreAverage.toFixed(1)}/10
                          </span>
                          </p>

                          <p className="text-xs text-[color:var(--color-muted-foreground)] mb-4 h-19 text-balance overflow-hidden">
                            {restaurant.description || "No description available."}
                          </p>

                          <div className="space-y-2">
                            <Label
                                htmlFor={`beer-rating-${restaurant.id}`}
                                className={"pl-0 block mb-4"}
                            >
                              Your Beer Rating:{" "}
                              <span className="font-bold text-[color:var(--color-accent)]">
                              {restaurant.userBeerScore}/10
                            </span>
                            </Label>
                            <BeerSlider
                                id={`beer-rating-${restaurant.id}`}
                                defaultValue={[restaurant.userBeerScore]}
                                onValueCommit={(val) =>
                                    handleBeerScoreCommit(restaurant.id, val)
                                }
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                ))}

                {selectedRestaurants.length === 0 && (
                    <p className="text-center text-[color:var(--color-muted-foreground)] p-4">
                      Select a restaurant from the dropdown to add it to your trip!
                    </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
