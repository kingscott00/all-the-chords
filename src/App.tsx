import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, ChordBrowser, Favorites, Compare } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chords" element={<Navigate to="/chords/a" replace />} />
        <Route path="/chords/:root" element={<ChordBrowser />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
