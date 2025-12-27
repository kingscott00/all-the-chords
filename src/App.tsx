import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Home, ChordBrowser, Favorites, Compare } from "./pages";
import { PageTransition } from "./components/Layout";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route path="/chords" element={<Navigate to="/chords/a" replace />} />
        <Route
          path="/chords/:root"
          element={
            <PageTransition>
              <ChordBrowser />
            </PageTransition>
          }
        />
        <Route
          path="/favorites"
          element={
            <PageTransition>
              <Favorites />
            </PageTransition>
          }
        />
        <Route
          path="/compare"
          element={
            <PageTransition>
              <Compare />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
