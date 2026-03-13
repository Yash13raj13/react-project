import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed w-full backdrop-blur-md bg-white/5 border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
          Harmoniq
        </Link>

        <div className="flex gap-8 text-gray-300">
          <Link to="/theory" className="hover:text-white transition">Theory</Link>
          <Link to="/instruments" className="hover:text-white transition">Instruments</Link>
          <Link to="/roadmap" className="hover:text-white transition">Roadmap</Link>
        </div>
      </div>
    </nav>
  );
}