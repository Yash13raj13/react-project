import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Piano from "./pages/Piano";
import Chords from "./pages/Chords";

const App = () => {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/piano" element={<Piano />} />
        <Route path="/chords" element={<Chords />} />
      </Routes>
    </>
  );
};

export default App;