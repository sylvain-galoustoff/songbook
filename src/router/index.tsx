import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home.tsx";
import LogIn from "../views/LogIn/LogIn.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";
import { PublicOnlyRoute } from "./PublicOnlyRoute.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PublicOnlyRoute>
        <LogIn />
      </PublicOnlyRoute>
    ),
  },
]);
