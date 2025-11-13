import "./App.css";
import Router from "./Router";
import MegaknightEasterEgg from "./components/commons/MegaknightEasterEgg";

function App() {
  return (
    <div className="bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
      <MegaknightEasterEgg />
      <Router />
    </div>
  );
}

export default App;
