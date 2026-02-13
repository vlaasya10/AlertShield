import { RouterProvider } from "react-router";
import { router } from "./routes";
import { generateNewEvents } from "./utils/mockData";

export default function App() {
  const handleGenerateEvents = () => {
    generateNewEvents(100);
    // Force a re-render by navigating to current path
    window.location.reload();
  };

  // Pass the handler through router context or use a state management solution
  // For simplicity, we'll attach it to the window object
  (window as any).handleGenerateEvents = handleGenerateEvents;

  return <RouterProvider router={router} />;
}