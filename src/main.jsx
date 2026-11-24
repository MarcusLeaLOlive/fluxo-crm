import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/crm.css";
import "./styles/landing.css";
import "./styles/motion.css";
import "./styles/effects.css";
import "./styles/features.css";

const container = document.getElementById("root");
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// A apresentação vem pré-renderizada no HTML: o React só "hidrata" (assume) a marcação.
// A demonstração (#app) não é pré-renderizada, então é montada do zero.
const isPrerendered = container.hasChildNodes() && window.location.hash !== "#app";
if (isPrerendered) hydrateRoot(container, app);
else {
  container.textContent = "";
  createRoot(container).render(app);
}
