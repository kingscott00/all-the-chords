import { useNavigate } from "react-router-dom";
import { ROOT_NOTES } from "../types";
import { Header } from "../components/Navigation";

export function Home() {
  const navigate = useNavigate();

  const handleRootClick = (root: string) => {
    const rootPath = root
      .split("/")[0]
      .toLowerCase()
      .replace("#", "sharp");
    navigate(`/chords/${rootPath}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All The Chords
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A comprehensive guitar chord reference with CAGED positions,
            inversions, and voicings for every chord type.
          </p>
        </section>

        {/* Root Note Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Select a Root Note
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {ROOT_NOTES.map((root) => {
              const displayName = root.includes("/")
                ? root.split("/")[0]
                : root;
              const altName = root.includes("/") ? root.split("/")[1] : null;

              return (
                <button
                  key={root}
                  onClick={() => handleRootClick(root)}
                  className="
                    bg-white rounded-xl shadow-sm border border-gray-200
                    hover:shadow-md hover:border-blue-300 hover:bg-blue-50
                    transition-all duration-200
                    p-6 text-center
                  "
                >
                  <div className="text-2xl font-bold text-gray-900">
                    {displayName}
                  </div>
                  {altName && (
                    <div className="text-sm text-gray-500 mt-1">{altName}</div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">CAGED System</h3>
            <p className="text-gray-600 text-sm">
              All voicings organized by CAGED shapes - C, A, G, E, and D
              positions across the fretboard.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Multiple Types</h3>
            <p className="text-gray-600 text-sm">
              Major, minor, 7th, maj7, and more chord types with multiple
              voicings each.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              Clear Diagrams
            </h3>
            <p className="text-gray-600 text-sm">
              Professional SVG chord diagrams with root note highlighting and
              fret position indicators.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
