import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { PlayerProvider } from "./context/player-context";
import { UserProvider } from "./context/user-context";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </UserProvider>
);
