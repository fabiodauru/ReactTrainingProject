import { useState } from "react";

export type Image = {
    image: File;
    description: string;
    Date: string;
};

interface ImagePickerProps {
    images: Image[];
    setImages: React.Dispatch<React.SetStateAction<Image[]>>;
}

export default function ImagePicker({ images, setImages }: ImagePickerProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    
    const addImage = (fileList: FileList | null) => {
        if (!fileList) return;

        const newFilesArray = Array.from(fileList);

        const newImageObjects = newFilesArray.map((file) => ({
            image: file,
            description: "",
            Date: new Date().toISOString(),
        } as Image));
        
        setImages((prevImages) => [
            ...prevImages,
            ...newImageObjects
        ]);
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
        }));
    }

    return (
        <div className="flex flex-col flex-1 min-w-xs bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Add Images</label>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full bg-slate-700 text-white p-2 rounded-lg"
                    onChange={(e) => addImage(e.target.files)}
                />
            </div>
            
            <div className="flex-1 overflow-y-auto mt-6 pr-2 max-h-62 no-scrollbar">
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
                                // Create object URL for local file preview
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
    );
}