import FormInput from "../components/FormInput.tsx";
import {useState} from "react";

export default function CreateTripPage(){
    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    const esse = "";
    
    type Image = { image: File, description: string , Date: string };
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    
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
    
    return (
        <div className="min-h-full bg-slate-950 p-6 text-white">
            <header>
                <h1>
                    Create your next Trip
                </h1>
            </header>
            <div className="flex items-center">
                <form onSubmit={handleSubmit} className="w-full space-y-4 ">
                    <div className="max-w-2xl">
                        <FormInput
                            label="Trip Name"
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            placeholder="Walking to the clouds"
                        />
                    </div>
                    
                    <div className="">
                        <div className="items-center">
                            Map🗺️
                        </div>

                        <div className="bg-slate-800 p-6 rounded-2xl max-w-2xl shadow-lg border border-slate-700">
                            <FormInput
                                label="Add Images"
                                type="file"
                                multiple
                                value={esse}
                                accept="image/*"
                                onChange={(e) => addImage(e.target.files)}
                            />

                            <div className="flex flex-wrap gap-4 mt-6">
                                {images.map((file, index) => (
                                    <div
                                        key={index}
                                        className={`relative group w-28 h-28 overflow-hidden rounded-xl cursor-pointer ${
                                            selectedIndex === index
                                                ? 'ring-4 ring-slate-400'
                                                : 'hover:ring-2 hover:ring-slate-400'
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

                            {selectedIndex !== null && (
                                <div className="mt-6 p-4 bg-slate-700/50 border border-slate-600 rounded-xl">
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
                        </div>
                    </div>
                    
                    <FormInput
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="The destination is above the clouds"
                    />
                </form>
            </div>
        </div>
    )
}