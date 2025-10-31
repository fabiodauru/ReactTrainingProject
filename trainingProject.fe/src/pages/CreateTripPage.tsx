import {useEffect, useState} from "react";
import CoordinatePicker, {
  type LatLng,
} from "../components/CoordinatePicker.tsx";
import { useNavigate } from "react-router-dom";
import ImagePicker, { type Image } from "../components/ImagePicker.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import { Slider } from "@/components/ui/slider"
import { ENDPOINTS } from "@/api/endpoints";
import { api } from "@/api/api";
import {cn} from "@/lib/utils.ts";
import type {Trip} from "@/api/type.ts";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


export default function CreateTripPage(){
    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [closestRestaurants, setClosestRestaurants] = useState<RestaurantDto[]>([]);
    const [isFetchingRestaurants, setIsFetchingRestaurants] = useState(false);

    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | undefined>(undefined);
    
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
    
    type Location = {
        latitude: number;
        longitude: number;
    }
    
    type RestaurantDto = {
        id: string;
        restaurantName: string;
        location: Location;
        beerScoreAverage: number;
        description: string;
    }
    
    type CalculatetRoute = {distance: number, duration: number};
    const [calculatedRoute, setCalculatedRoute] = useState<CalculatetRoute | null>(null);
    const [tripCords, setTripCords] = useState<CordsData>({ startCords: null, endCords: null });
    type SliderProps = React.ComponentProps<typeof Slider>
    
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

    try{
        await api.post<Trip>(`${ENDPOINTS.TRIP.CREATE}`, {
            newTrip,
        });
        navigate("/trips");
    }catch(err){
        setError(true);
    }
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

    function BeerSlider({ className, ...props }: SliderProps) {
        return (
            <Slider
                defaultValue={[7]}
                max={10}
                step={1}
                className={cn("w-[100%]", className)}
                {...props}
            />
        )
    }

    useEffect(() => {
        const { startCords, endCords } = tripCords;
        
        if (startCords && endCords) {
            fetchClosestRestaurants(startCords, endCords);
        } else {
            setClosestRestaurants([]);
            setSelectedRestaurantId(undefined);
        }
    }, [tripCords]);

    const fetchClosestRestaurants = async (startCords: LatLng, endCords: LatLng) => {
        setIsFetchingRestaurants(true);
        const queryParams = new URLSearchParams({
            "StartCoordinates.Latitude": String(startCords.lat),
            "StartCoordinates.Longitude": String(startCords.lng),
            "EndCoordinates.Latitude": String(endCords.lat),
            "EndCoordinates.Longitude": String(endCords.lng),
        }).toString();

        const url = `http://localhost:5065/api/Restaurants/closest?${queryParams}`;


        try {
            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data: { message: number, result?: { results: RestaurantDto[] } } = await response.json();
                
                if (data.message === 2 && data.result?.results) {
                    setClosestRestaurants(data.result.results);
                    if (!selectedRestaurantId && data.result.results.length > 0) {
                        setSelectedRestaurantId(data.result.results[0].id);
                    }
                } else {
                    console.error("Backend did not return success:", data.message);
                    setClosestRestaurants([]);
                }
            } else {
                console.error("HTTP error fetching restaurants:", response.status);
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
                            <Label htmlFor="tripName" className={"pl-3"}>Trip Name</Label>
                            <Input
                                id="tripName"
                                value={tripName}
                                onChange={(e) => setTripName(e.target.value)}
                                placeholder="Walking to the clouds"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className={"pl-3"}>Trip Description</Label>
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
                            <p className="text-sm text-[color:var(--color-muted-foreground)]">
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

                        <ImagePicker
                            images={images}
                            setImages={setImages}
                        />
                        
                        <div className="w-full md:w-1/2 flex flex-col border border-[color:var(--color-muted)] rounded-lg">
                            <h3 className="text-md font-semibold text-[color:var(--color-foreground)] mb-3 mt-3">
                                Select restaurants
                            </h3>
                            
                            <div className="flex flex-col gap-4 p-3">
                                
                                <div>
                                    <label
                                        htmlFor="restaurant-type"
                                        className="block text-sm font-medium text-[color:var(--color-muted-foreground)] mb-1"
                                    >
                                        Restaurants on your Trip
                                    </label>
                                    <Select
                                        value={selectedRestaurantId}
                                        onValueChange={(val) => setSelectedRestaurantId(val)}
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
                                                {closestRestaurants.map((restaurant) => (
                                                    <SelectItem key={restaurant.id} value={restaurant.id}>
                                                        {restaurant.restaurantName}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="">
                                <BeerSlider></BeerSlider>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
