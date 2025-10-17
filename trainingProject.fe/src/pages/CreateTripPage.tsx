import FormInput from "../components/FormInput.tsx";
import {useState} from "react";
import CoordinatePicker, {type LatLng } from "../components/CoordinatePicker.tsx";
import { useNavigate } from "react-router-dom";

export default function CreateTripPage(){
    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    
    type Image = { image: File, description: string , Date: string };
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    type CordsData = {
        startCords: LatLng | null;
        endCords: LatLng | null;
    };
    
    type CalculatetRoute = {distance: number, duration: number};
    const [calculatedRoute, setCalculatedRoute] = useState<CalculatetRoute | null>(null);
    const [tripCords, setTripCords] = useState<CordsData>({ startCords: null, endCords: null });
    
    const addImage = (fileList: FileList) => {
        const newFilesArray = Array.from(fileList);
        
        const newImageObjects = newFilesArray.map((file) => {
            return {
                image: file,
                description: "",
                Date: new Date().toISOString()
            } as Image;
        });
        
        setImages((prevImages) => [
            ...prevImages,
            ...newImageObjects
        ]);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            Images: [],
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
    
    const handleDeleteImage = () => {
        if (selectedIndex === null) return;
        
        setImages((prevImages) => prevImages.filter((_, i) => i !== selectedIndex));
        setSelectedIndex(null);
    };
    
    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDescription = e.target.value;
        
        setImages((prevImages) => prevImages.map((img, i) => {
            if (i === selectedIndex) {
                return {...img, description: newDescription};
            }
            return img;
        }))
    }

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


    return (
        <div className="min-h-full bg-primary p-6 text-white">
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
                            <div>
                                <FormInput
                                    label="Add Images"
                                    type="file"
                                    multiple
                                    value={''}
                                    accept="image/*"
                                    onChange={(e) => addImage(e.target.files)}
                                />
                            </div>

                            {/* */}
                            <div className="flex-1 overflow-y-auto mt-6 pr-2 max-h-62">
                                <div className="flex flex-wrap gap-4 p-2">
                                    {images.map((file, index) => (
                                        <div
                                            key={index}
                                            className={`relative group w-27 h-27 overflow-hidden rounded-xl cursor-pointer transition-transform duration-200 ${
                                                selectedIndex === index
                                                    ? 'ring-4 ring-slate-400 scale-105'
                                                    : 'hover:ring-2 hover:ring-slate-400 hover:scale-105'
                                            }`}
                                            onClick={() => setSelectedIndex(index)}
                                        >
                                            <img
                                                src={URL.createObjectURL(file.image)}
                                                alt={`Trip Image ${index}`}
                                                className="object-cover w-full h-full rounded-xl"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700">
                                {selectedIndex !== null && (
                                    <div className="p-4 mb-4 bg-slate-700/50 border border-slate-600 rounded-xl">
                                        <h3 className="text-sm font-medium text-slate-300 mb-2">Edit Image Details</h3>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-200 text-slate-900 p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-3"
                                            placeholder="Add image description..."
                                            value={images[selectedIndex]?.description || ''}
                                            onChange={handleDescriptionChange}
                                        />
                                        <button
                                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors duration-200 font-medium"
                                            onClick={handleDeleteImage}
                                        >
                                            Delete Image
                                        </button>
                                    </div>
                                )}

                                {selectedIndex === null && images.length > 0 && (
                                    <b className="block mb-4 text-slate-300 text-center">
                                        Select an image to add a description or delete it.
                                    </b>
                                )}
                            </div>
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