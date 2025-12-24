import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home";
import Login  from "../views/Login/Login";
import TrackIndex from "../views/TrackIndex/TrackIndex";
import PrivateRoute from "./PrivateRoute";

const isAuthenticated = Boolean(localStorage.getItem("userToken"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute isAuthenticated={isAuthenticated}>
        <Home />
      </PrivateRoute>
    ),
  },
  {
    path: "/signin",
    element: <Home />,
  },
  {
    path: "/Login",
    element: (
      <PrivateRoute isAuthenticated={isAuthenticated}>
        <Login />
      </PrivateRoute>
    ),
  },
  {
    path: "/TrackIndex",
    element: (
      <PrivateRoute isAuthenticated={isAuthenticated}>
        <TrackIndex />
      </PrivateRoute>
    ),
  },
]);

export default router;