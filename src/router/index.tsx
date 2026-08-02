import { createBrowserRouter, Outlet } from "react-router";
import Home from "../views/Home/Home.tsx";
import Song from "../views/Song/Song.tsx";
import LogIn from "../views/LogIn/LogIn.tsx";
import SongName from "../views/NewSong/SongName/SongName.tsx";
import SongAction from "../views/NewSong/SongAction/SongAction.tsx";
import LyricsText from "../views/NewSong/LyricsText/LyricsText.tsx";
import TrackMode from "../views/NewSong/TrackMode/TrackMode.tsx";
import SelectTrack from "../views/NewSong/SelectTrack/SelectTrack.tsx";
import SelectInstrument from "../views/NewSong/SelectInstrument/SelectInstrument.tsx";
import Recap from "../views/NewSong/Recap/Recap.tsx";
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
    path: "/song/:id",
    element: (
      <ProtectedRoute>
        <Song />
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
    children: [
      { path: "song-name", element: <SongName /> },
      { path: "song-action", element: <SongAction /> },
      { path: "lyrics-text", element: <LyricsText /> },
      { path: "track-mode", element: <TrackMode /> },
      { path: "select-track", element: <SelectTrack /> },
      { path: "select-instrument", element: <SelectInstrument /> },
      { path: "recap", element: <Recap /> },
    ],
  },
]);
