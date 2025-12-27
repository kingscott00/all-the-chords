import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home, ChordBrowser } from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chords" element={<Navigate to="/chords/a" replace />} />
        <Route path="/chords/:root" element={<ChordBrowser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
