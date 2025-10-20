import FormInput from "../components/FormInput.tsx";
import {useState} from "react";
import CoordinatePicker, {type LatLng } from "../components/CoordinatePicker.tsx";
import { useNavigate } from "react-router-dom";
import ImagePicker, { type Image } from "../components/ImagePicker.tsx";

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
    }
    
    type CalculatetRoute = {distance: number, duration: number};
    const [calculatedRoute, setCalculatedRoute] = useState<CalculatetRoute | null>(null);
    const [tripCords, setTripCords] = useState<CordsData>({ startCords: null, endCords: null });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const imagePromises: Promise<ImageDto>[] = images.map((image) => {
            const base64Promise = fileToBase64(image.image);
            
            return base64Promise.then(base64String => {
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
        
        const response = await fetch(
            "http://localhost:5065/Trips",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTrip),
                credentials: "include",
            }
        );

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
                resolve(result.split(',')[1]);
            };
            
            reader.onerror = (error) => reject(error);
        });
    };


    return (
        <div className="min-h-full bg-background p-6 text-white">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Create your next Trip</h1>
            </header>

            <div className="flex items-start gap-6">
                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    <div className="flex items-center justify-between">
                        <FormInput
                            label="Trip Name"
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            placeholder="Walking to the clouds"
                        />
                        {error && (
                            <p className="text-red-500 mt-4 hover:text-red-400">
                                Can not create your Trip
                            </p>
                        )}
                        <button className="px-4 py-2 bg-gray-900 rounded-lg hover:bg-gray-700 transition">
                            Create Trip
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <div className="flex flex-col flex-1 min-w-xs bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                            <FormInput
                                label="Trip Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="The destination is above the clouds"
                            />
                            
                            <ImagePicker
                                images={images}
                                setImages={setImages}
                            />
                        </div>

                        <div className="flex-1 min-w-xs bg-slate-800 p-4 pt-0 rounded-2xl shadow-lg border border-slate-700 flex flex-col">
                            <CoordinatePicker
                                title="Pin your Trip"
                                onRouteCalculated={handleRouteCalculated}
                                onCoordinatesChange={handleCords}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}