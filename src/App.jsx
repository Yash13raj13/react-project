import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Theory from "./pages/Theory";
import Instruments from "./pages/Instruments";
import Roadmap from "./pages/Roadmap";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <Router>
      <div className="bg-[#0f0f14] text-white min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/theory" element={<Theory />} />
          <Route path="/instruments" element={<Instruments />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}