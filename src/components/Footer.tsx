export default function Footer() {
  return (
    <footer className="py-10 border-t border-white/10 text-center text-gray-500 mt-20">
      © {new Date().getFullYear()} Harmoniq. Built with React & Tailwind.
    </footer>
  );
}