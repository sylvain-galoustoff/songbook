import { createBrowserRouter } from "react-router";
import AnimatedLayout from "../AnimatedLayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import Signin from "../views/Signin/Signin";
import AddSong from "../views/AddSong/AddSong";
import Song from "../views/song/Song";
import HomeFooter from "../views/Home/HomeFooter";
import SongFooter from "../views/song/SongFooter";
import InstallApp from "../views/InstallApp/InstallApp";

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
        handle: {
          title: "Vos titres",
          footer: <HomeFooter />,
        },
      },
      {
        path: "/login",
        element: <Login />,
        handle: {
          title: "Connexion",
        },
      },
      {
        path: "/signin",
        element: <Signin />,
        handle: {
          title: "Inscription",
        },
      },
      {
        path: "/add-song",
        element: (
          <PrivateRoute>
            <AddSong />
          </PrivateRoute>
        ),
        handle: {
          title: "Ajouter un titre",
          backArrow: true,
        },
      },
      {
        path: "/song/:id",
        element: (
          <PrivateRoute>
            <Song />
          </PrivateRoute>
        ),
        handle: {
          title: "Titre",
          backArrow: true,
          footer: <SongFooter />,
        },
      },
      {
        path: "/install",
        element: <InstallApp />,
        handle: {
          title: "Installer Songbook",
        },
      },
    ],
  },
]);

export default router;
