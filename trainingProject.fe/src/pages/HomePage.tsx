import { useNavigate } from "react-router-dom";
import WidgetLayout from "../widgets/layout";
import WidgetContainer from "../widgets/WidgetContainer";
import ListWidget from "../widgets/widgets/ListWidget";
import MapWidget from "../widgets/widgets/MapWidget";

export default function HomePage() {
  const navigate = useNavigate();
  const trips = ["Trip to Paris", "Trip to New York", "Trip to Tokyo"];
  const flights = [
    "Flight to Paris - 2023-10-01",
    "Flight to New York - 2023-11-15",
    "Flight to Tokyo - 2023-12-20",
    "Flight to London - 2024-01-10",
    "Flight to Sydney - 2024-02-05",
    "Flight to Berlin - 2024-03-12",
  ];

  const handleListClick = () => {
    navigate("/trips");
  };

  const handlenothing = () => {
    // do nothing
  };

  return (
    <div className="">
      <p>Welcome to our banger training project TravelBucket</p>
      <WidgetLayout>
        <WidgetContainer size="large" onClick={handlenothing}>
          <MapWidget
            start={{ lat: 48.8566, lng: 2.3522 }}
            end={{ lat: 47.3005, lng: 8.434 }}
          />
        </WidgetContainer>

        <WidgetContainer size="medium" onClick={handleListClick}>
          <ListWidget title="Dashboard" content={trips} amount={2} />
        </WidgetContainer>

        <WidgetContainer size="large" onClick={handleListClick}>
          <ListWidget title="Detailed View" content={flights} amount={10} />
        </WidgetContainer>
      </WidgetLayout>
    </div>
  );
}
