import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./index.css";
import { chromeApi } from "./chromeAI.ts";

chromeApi.isAvailable().then((aiAvailable) => {
  createRoot(document.getElementById("root")!).render(
    <App aiAvailable={aiAvailable} />
  );
});

