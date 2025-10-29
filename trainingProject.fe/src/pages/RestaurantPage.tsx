import { useNavigate } from "react-router-dom";

export default function RestaurantPage() {
    const navigate = useNavigate();
    
    const handleRegisterRestaurant = () => {
        navigate("/registerRestaurant");
    }
    
    return(
        <div>
            <h1>
                Restaurant Page, mit all dem
            </h1>
            <button onClick={handleRegisterRestaurant}>
                Register new Restaurant
            </button>
        </div>
    )
}