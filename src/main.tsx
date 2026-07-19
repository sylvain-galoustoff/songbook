import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./styles/index.scss";
import { router } from "./router";
import { PwaUpdatePrompt } from "./components/PwaUpdatePrompt/PwaUpdatePrompt";
import { AuthProvider } from "./hooks/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <PwaUpdatePrompt />
    </AuthProvider>
  </StrictMode>,
);
