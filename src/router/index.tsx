import { createBrowserRouter, Outlet } from "react-router";
import Home from "../views/Home/Home.tsx";
import LogIn from "../views/LogIn/LogIn.tsx";
import SongName from "../views/NewSong/SongName/SongName.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";
import { PublicOnlyRoute } from "./PublicOnlyRoute.tsx";
import { NewSongWizardProvider } from "../hooks/NewSongWizardProvider.tsx";

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
  {
    path: "/new-song",
    element: (
      <ProtectedRoute>
        <NewSongWizardProvider>
          <Outlet />
        </NewSongWizardProvider>
      </ProtectedRoute>
    ),
    children: [{ path: "song-name", element: <SongName /> }],
  },
]);
