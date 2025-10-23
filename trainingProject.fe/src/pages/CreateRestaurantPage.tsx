import FormInput from "../components/FormInput.tsx";
import {useState} from "react";
import ImagePicker, { type Image } from "../components/ImagePicker.tsx";
import CoordinatePicker, {type LatLng } from "../components/CoordinatePicker.tsx";
import { useNavigate } from "react-router-dom";
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";

export default function CreateRestaurantPage() {
    const [restaurantName, setRestaurantName] = useState("");
    const [beerScore, setBeerScore] = useState("");
    const [description, setDescription] = useState("");
    const [siteURL, setSiteURL] = useState("");
    const [images, setImages] = useState<Image[]>([]);
    const [restaurantCords, setRestaurantCords] = useState<LatLng>();
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    type ImageDto = {
        ImageFile: string;
        Description: string;
        UserId: string;
        Date: string;
    };
    
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
        const cordsDto = {
            Latitude : restaurantCords?.lat.toString(),
            Longitude: restaurantCords?.lat.toString(),
        }
        
        const newRestaurant = {
            RestaurantName: restaurantName,
            Location: cordsDto,
            BeerScore: beerScore,
            Description: description,
            Images: imageDtos,
            WebsiteUrl: siteURL,
        };

        const response = await fetch("http://localhost:5065/api/Restaurants", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRestaurant),
            credentials: "include",
        });

        if (response.ok) {
            navigate("/");
        } else {
            setError(true);
        }
    }

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
    
    return(
        <div className="min-h-full bg-background p-6 text-white">
            <header className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">Register a new Restaurant</h1>
                {error && (
                    <a className={"text-error"}>
                        Failed to register restaurant
                    </a>
                )}
            </header>

            <div className="w-full items-start gap-6">
                <form className="w-full flex gap-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col w-1/2">
                        <Label className={"p-3"}>Restaurant name</Label>
                        <Input
                            value={restaurantName}
                            onChange={(e) => setRestaurantName(e.target.value)}
                            required={true}
                            placeholder={"Enter the Restaurant Name"}
                        />

                        <Label className={"p-3 pt-4"}>Beer Score</Label>
                        <Input
                            type={"number"}
                            value={beerScore}
                            required={true}
                            onChange={(e) => HandleBeerscore(e.target.value)}
                            placeholder={"Rate the beer from 1 to 10"}
                        />

                        <Label className={"p-3 pt-4"}>Description</Label>
                        <Input
                            value={description}
                            required={true}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={"Describe the Restaurant"}
                        />

                        <Label className={"p-3 pt-4"}>Website</Label>
                        <Input
                            value={siteURL}
                            required={true}
                            onChange={(e) => setSiteURL(e.target.value)}
                            placeholder={"Enter the Websites website URL"}
                        />

                        <CoordinatePicker
                            mode="point"
                            title="Pin your Restaurant"
                            onCoordinatesChange={(point, _) => {
                                if (point) {
                                    setRestaurantCords(point);
                                }
                            }}
                        />
                    </div>
                    <div className="flex flex-col w-1/2">
                        <ImagePicker
                            images={images}
                            setImages={setImages}
                        />
                        <div className="bg-[color:var(--color-primary)] p-6 mt-3 rounded-2xl border-[color:var(--color-muted)]">
                            <button className={"bg-[color:var(--color-muted)] p-3 rounded-md hover:bg-[color:var(--color-accent)] transition-all duration-300"} 
                                    type="submit"
                            >
                                Register Restaurant
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}