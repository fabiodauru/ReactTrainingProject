import { useNavigate } from "react-router-dom";
import WidgetLayout from "../widgets/layout";
import WidgetContainer from "../widgets/WidgetContainer";
import ListWidget from "../widgets/widgets/ListWidget";

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
  const todos = [
    "Book flight tickets",
    "Pack luggage",
    "Check passport validity",
    "Arrange airport transfer",
    "Confirm hotel reservations",
    "Create travel itinerary",
  ];

  const handleListClick = () => {
    navigate("/trips");
  };

  return (
    <div className="">
      <p>Welcome to our banger training project TravelBucket</p>
      <WidgetLayout>
        <WidgetContainer size="small" onClick={handleListClick}>
          <ListWidget title="Quick Stats" content={todos} />
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
