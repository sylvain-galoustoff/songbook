import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home.tsx";
import SignIn from "../views/SignIn/SignIn.tsx";
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
    path: "/sign-in",
    element: (
      <PublicOnlyRoute>
        <SignIn />
      </PublicOnlyRoute>
    ),
  },
]);
