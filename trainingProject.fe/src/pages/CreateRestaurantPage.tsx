import FormInput from "../components/FormInput.tsx";
import {useState} from "react";
import ImagePicker, { type Image } from "../components/ImagePicker.tsx";
import CoordinatePicker, {type LatLng } from "../components/CoordinatePicker.tsx";

export default function CreateRestaurantPage() {
    const [restaurantName, setRestaurantName] = useState("");
    const [beerScore, setBeerScore] = useState("");
    const [description, setDescription] = useState("");
    const [siteURL, setSiteURL] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    
    const HandleBeerscore = (input : number) => {
        if (input > 10){
            setBeerScore(`${10}`);
            return;
        }else if(input < 0){
            setBeerScore(`${0}`)
            return;
        }
        setBeerScore(`${input}`);
    }
    
    return(
        <div className="min-h-full bg-background p-6 text-white">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Register a new Restaurant</h1>
            </header>

            <div className="w-full items-start gap-6">
                <form className="w-full flex gap-6">
                    <div className="flex flex-col w-1/2">
                        <FormInput
                            label={"Restaurant Name"}
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            placeholder={"Enter the Restaurant Name"}
                        />

                        <FormInput
                            type={"number"}
                            label={"Beer Score"}
                            value={beerScore}
                            onChange={(e) => HandleBeerscore(e.target.value)}
                            placeholder={"Rate the beer from 1 to 10"}
                        />

                        <FormInput
                            label={"Description"}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={"Describe the Restaurant"}
                        />

                        <FormInput
                            label={"Website"}
                            value={siteURL}
                            onChange={(e) => setSiteURL(e.target.value)}
                            placeholder={"Enter the Websites website URL"}
                        />

                        <CoordinatePicker
                            title={"Select the Location of the restaurant"}
                        />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <ImagePicker
                            images={images}
                            setImages={setImages}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}