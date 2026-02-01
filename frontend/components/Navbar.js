"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const setNavVar = () => {
      const h = navRef.current?.offsetHeight || 80;
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      setNavVar();
    };
    onScroll();
    setNavVar();
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", setNavVar);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", setNavVar);
    };
  }, []);

  return (
    <motion.nav
      ref={navRef}
      className={`sticky top-0 left-0 w-full z-50 ${scrolled ? "bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-2xl shadow-lg ring-1 ring-neutral-200/60" : "bg-gradient-to-b from-white/70 to-white/50 backdrop-blur-xl shadow-md ring-1 ring-white/50"}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group ml-[-4px] md:ml-[-6px]">
          {/* Brand logo */}
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src="/logo_autosense.png"
              alt="AutoSense Logo"
              width={72}
              height={72}
              className="w-[72px] h-[72px] object-contain transform origin-left scale-[1.45]"
              priority
            />
          </motion.div>
          <div className="flex flex-col space-y-0.5">
            <span className="font-extrabold leading-tight text-lg md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-teal-700 to-lime-700">AutoSense</span>
            <span className="leading-snug text-[12px] text-gray-500">Premium Analytics</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <motion.a
            href="#upload"
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById("upload");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-lime-600 shadow-md hover:shadow-xl transition-all overflow-hidden"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_60%)]" />
            <span className="relative z-10">Upload</span>
            <svg className="relative z-10" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.a>
          </div>
      </div>
    </motion.nav>
  );
}
