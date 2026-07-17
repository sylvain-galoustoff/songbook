import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./styles/index.scss";
import { router } from "./router";
import { PwaUpdatePrompt } from "./components/PwaUpdatePrompt/PwaUpdatePrompt";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <PwaUpdatePrompt />
  </StrictMode>,
);
