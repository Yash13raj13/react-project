import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="relative overflow-hidden">

      {/* 🌌 Background Glow Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/30 blur-3xl rounded-full"></div>
      <div className="absolute top-60 -right-40 w-96 h-96 bg-cyan-500/20 blur-3xl rounded-full"></div>

      {/* 🔥 HERO SECTION */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-32">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent"
        >
          Master Music Theory The Smart Way
        </motion.h1>

        <p className="mt-6 text-gray-400 max-w-2xl text-lg">
          Structured lessons, instrument guides & curated practice — all in one beautifully designed platform.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/theory"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold hover:scale-105 transition"
          >
            Start Learning
          </Link>

          <Link
            to="/instruments"
            className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition"
          >
            Explore Instruments
          </Link>
        </div>
      </section>

      {/* 🎼 WHAT YOU’LL LEARN */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What You’ll Learn
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              title: "Music Theory",
              desc: "Scales, chords, harmony & rhythm fundamentals",
            },
            {
              title: "Instruments",
              desc: "Guitar, Piano, Violin & more",
            },
            {
              title: "Roadmaps",
              desc: "Structured weekly learning paths",
            },
            {
              title: "Daily Practice",
              desc: "Exercises & curated tutorials",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl hover:scale-105 transition duration-300"
            >
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-gray-400 mt-3 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🎸 INSTRUMENT PREVIEW */}
      <section className="py-20 px-6 bg-[#13131a]">
        <h2 className="text-3xl font-bold text-center mb-12">
          Explore Popular Instruments
        </h2>

        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {["Guitar", "Piano", "Violin", "Drums"].map((instrument, index) => (
            <div
              key={index}
              className="relative rounded-2xl overflow-hidden group cursor-pointer"
            >
              <div className="h-60 bg-gradient-to-br from-violet-600/30 to-cyan-500/20 group-hover:scale-110 transition duration-500"></div>

              <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                <h3 className="text-lg font-bold">{instrument}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🧠 ROADMAP SECTION */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">
          Structured Learning Roadmap
        </h2>

        <div className="space-y-8">
          {[
            "Beginner → Understand Notes & Scales",
            "Intermediate → Master Chords & Progressions",
            "Advanced → Harmony & Composition",
          ].map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-4 justify-center"
            >
              <div className="w-4 h-4 bg-violet-500 rounded-full"></div>
              <p className="text-gray-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 FINAL CTA */}
      <section className="py-20 px-6 text-center bg-gradient-to-r from-violet-700/30 to-cyan-600/20">
        <h2 className="text-4xl font-bold mb-6">
          Start Your Musical Journey Today
        </h2>

        <Link
          to="/theory"
          className="px-8 py-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
        >
          Begin Learning
        </Link>
      </section>

    </div>
  );
}