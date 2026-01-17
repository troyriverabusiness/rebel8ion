// ABOUTME: Application entry point with route-based lazy loading.
// ABOUTME: Renders AgentPage for /agent path, main App for all other routes.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const root = document.getElementById("root")!;

// Route-based lazy loading: Agent page is completely separate from main app
// This ensures the ElevenLabs SDK is only loaded when needed
if (window.location.pathname === "/agent") {
  import("./pages/AgentPage").then(({ default: AgentPage }) => {
    createRoot(root).render(
      <StrictMode>
        <AgentPage />
      </StrictMode>
    );
  });
} else {
  import("./App").then(({ default: App }) => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
}
