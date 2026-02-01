"use client";

import { motion } from "framer-motion";

export default function PrimaryButton({ children, href = "#" }) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
    >
      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
      <motion.span
        className="absolute -left-1/2 top-0 h-full w-1/2 bg-white/30 blur-xl"
        initial={{ x: "-120%", opacity: 0 }}
        animate={{ x: "220%", opacity: [0, 0.8, 0] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <span className="relative z-10 font-semibold">{children}</span>
    </motion.a>
  );
}