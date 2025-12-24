import { createBrowserRouter } from "react-router";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import TrackIndex from "../views/TrackIndex/TrackIndex";
import Signin from "../views/Signin/Signin";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/Login",
    element: <Login />,
  },
  {
    path: "/TrackIndex",
    element: <TrackIndex />,
  },
]);

export default router;
