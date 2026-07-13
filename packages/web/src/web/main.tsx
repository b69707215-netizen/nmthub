import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./iphone-se.css";
import "./site-plus.css";
import App from "./app";
import { initAnalytics } from "./analytics";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

initAnalytics();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
