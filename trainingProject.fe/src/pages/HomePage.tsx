import WidgetLayout from "../widgets/layout";
import WidgetContainer from "../widgets/WidgetContainer";
import ListWidget from "../widgets/widgets/ListWidget";

export default function HomePage() {
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
  return (
    <div className="">
      <p>Welcome to our banger training project TravelBucket</p>
      <WidgetLayout>
        <WidgetContainer size="small">
          <ListWidget title="Quick Stats" content={todos} amount={5} />
        </WidgetContainer>

        <WidgetContainer size="medium">
          <ListWidget title="Dashboard" content={trips} />
        </WidgetContainer>

        <WidgetContainer size="large">
          <ListWidget title="Detailed View" content={flights} amount={10} />
        </WidgetContainer>
      </WidgetLayout>
    </div>
  );
}
