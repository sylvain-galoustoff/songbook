import { createBrowserRouter } from "react-router";
import AnimatedLayout from "../AnimatedLayout";
import PrivateRoute from "./PrivateRoute";
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
import Signin from "../views/Signin/Signin";

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
    ],
  },
]);

export default router;
