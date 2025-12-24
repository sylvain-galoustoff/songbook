import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import TrackIndex from "../views/TrackIndex/TrackIndex";
import Signin from "../views/Signin/Signin";
import PrivateRoute from "./PrivateRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/TrackIndex",
    element: (
      <PrivateRoute>
        <TrackIndex />
      </PrivateRoute>
    ),
  },
]);

export default router;
