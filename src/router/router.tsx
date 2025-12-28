import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import TrackIndex from "../views/Song/Song";
import Signin from "../views/Signin/Signin";
import PrivateRoute from "./PrivateRoute";
import AddSong from "../views/AddSong/AddSong";
import AnimatedLayout from "../AnimatedLayout";

const router = createBrowserRouter([
  {
    element: <AnimatedLayout />,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/song/:id",
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
    ],
  },
]);

export default router;
