import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, ChordBrowser, Favorites } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chords" element={<Navigate to="/chords/a" replace />} />
        <Route path="/chords/:root" element={<ChordBrowser />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
