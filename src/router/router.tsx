import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import TrackIndex from "../views/TrackIndex/TrackIndex";
import Signin from "../views/Signin/Signin";
import PrivateRoute from "./PrivateRoute";
import AddSong from "../views/AddSong/AddSong";

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
    path: "/trackIndex",
    element: (
      <PrivateRoute>
        <TrackIndex />
      </PrivateRoute>
    ),
  },
  {
    path: "/add-song",
    element: (
      <PrivateRoute>
        <AddSong />
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
]);

export default router;
