import FormInput from "../components/FormInput.tsx";
import {useState} from "react";
import CoordinatePicker from "../components/CoordinatePicker.tsx";

export default function CreateTripPage(){
    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    const esse = "";
    
    type Image = { image: File, description: string , Date: string };
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    
    type CalculatetRoute = {distance: number, duration: number};
    const [calculatedRoute, setCalculatedRoute] = useState<CalculatetRoute | null>(null);
    
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
    const handleSubmit = () => {
        
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

    return (
        <div className="min-h-full bg-slate-950 p-6 text-white">
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
                        <button className="flex-shrink-0">
                            Create Trip
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <div className="flex flex-col flex-1 min-w-xs bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                            <div>
                                <FormInput
                                    label="Add Images"
                                    type="file"
                                    multiple
                                    value={esse}
                                    accept="image/*"
                                    onChange={(e) => addImage(e.target.files)}
                                />
                            </div>

                            {/* */}
                            <div className="flex-1 overflow-y-auto mt-6 pr-2 max-h-62">
                                <div className="flex flex-wrap gap-4">
                                    {images.map((file, index) => (
                                        <div
                                            key={index}
                                            className={`relative group w-28 h-28 overflow-hidden rounded-xl cursor-pointer transition-transform duration-200 ${
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

                                <FormInput
                                    label="Trip Description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="The destination is above the clouds"
                                />
                            </div>
                        </div>

                        <div className="flex-1 min-w-xs bg-slate-800 p-4 pt-0 rounded-2xl shadow-lg border border-slate-700 flex flex-col">
                            <CoordinatePicker
                                title="Pin your Trip"
                                onRouteCalculated={handleRouteCalculated}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}