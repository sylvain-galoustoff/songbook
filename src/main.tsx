import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "./pwa";
import router from "./router/router";
import { RouterProvider } from "react-router/dom";
import { AuthProvider } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import { CommentsProvider } from "./context/CommentsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AudioProvider>
        <CommentsProvider>
          <RouterProvider router={router} />
        </CommentsProvider>
      </AudioProvider>
    </AuthProvider>
  </StrictMode>
);
