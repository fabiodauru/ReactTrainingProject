import FormInput from "../components/FormInput.tsx";
import {useState} from "react";
import MapWidget from "../widgets/widgets/MapWidget";

export default function CreateTripPage(){
    const [tripName, setTripName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    
    const addImage = () => {
        setImages([...images]);
    }
    const handleSubmit = () => {
        
    }
    
    return (
        <div className="min-h-full bg-slate-950 p-6 text-white">
            <header>
                <h1>
                    Create your next Trip
                </h1>
            </header>
            <div className="flex items-center">
                <form onSubmit={handleSubmit}>
                    <FormInput
                        label="Trip Name"
                        value={tripName}
                        onChange={(e) => setTripName(e.target.value)}
                        placeholder="Walking to the clouds"
                    />
                    
                    <div className="flex items-center">
                        Map🗺️
                    </div>

                    <FormInput
                        label="Add images🖼️"
                        type="file"
                        multiple={true}
                        value={images}
                        accept="image/*"
                        onChange={(e) => setImages(e.target.value)}
                        placeholder="The destination is above the clouds"
                    />
                    
                    <div className="flex items-center bg-green-200">
                        Time⌚
                        <input
                        type="time"/>
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