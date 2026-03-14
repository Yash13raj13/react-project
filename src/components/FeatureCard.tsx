import FeatureCard from "../components/FeatureCard";
import { Piano, Guitar, Music } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">

      <section className="flex flex-col items-center text-center px-6">

        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-6">
          Learn Music Theory
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Explore chords, scales, and instruments with interactive tools
          designed to make learning music simple and engaging.
        </p>

        <div className="flex gap-6">
          <button className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
            Start Learning
          </button>

          <button className="border border-gray-400 px-8 py-3 rounded-lg hover:bg-gray-100 transition">
            Explore Tools
          </button>
        </div>

      </section>

      <section className="mt-24 px-10">

        <h2 className="text-3xl font-bold text-center mb-12">
          Interactive Learning Tools
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <FeatureCard
            icon={<Piano size={40} />}
            title="Interactive Piano"
            description="Play notes and understand musical scales visually."
          />

          <FeatureCard
            icon={<Guitar size={40} />}
            title="Chord Generator"
            description="Discover chords and learn how they are constructed."
          />

          <FeatureCard
            icon={<Music size={40} />}
            title="Instrument Guide"
            description="Learn about instruments and how they produce sound."
          />

        </div>

      </section>

    </div>
  );
};

export default Home;