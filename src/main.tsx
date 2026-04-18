import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// CHANGED: Import HashRouter instead of BrowserRouter
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* CHANGED: Use HashRouter. You also do not need the basename property anymore! */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
