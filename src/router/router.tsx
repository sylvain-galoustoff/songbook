import { createBrowserRouter } from "react-router";
import AnimatedLayout from "../AnimatedLayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import Signin from "../views/Signin/Signin";
import AddSong from "../views/AddSong/AddSong";
import Song from "../views/song/Song";

const router = createBrowserRouter([
  {
    element: <AnimatedLayout />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signin",
        element: <Signin />,
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
        path: "/song/:id",
        element: (
          <PrivateRoute>
            <Song />
          </PrivateRoute>
        ),
      },
    ],
  },
]);

export default router;
