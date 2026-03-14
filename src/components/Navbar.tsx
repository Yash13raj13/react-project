import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-md bg-white/70 border-b border-gray-200 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

        <h1 className="text-xl font-bold text-gray-900">
          MusicTheory
        </h1>

        <div className="flex items-center gap-8 text-gray-700 font-medium">
          <Link to="/" className="hover:text-black transition">Home</Link>
          <Link to="/piano" className="hover:text-black transition">Piano</Link>
          <Link to="/chords" className="hover:text-black transition">Chords</Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;