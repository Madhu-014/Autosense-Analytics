"use client";

import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import UploadCard from "../components/UploadCard";
import BackgroundChartPattern from "../components/BackgroundChartPattern";
import DashboardGallery from "../components/DashboardGallery";

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-lime-50">
      {/* Ambient visuals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-220px] left-[-180px] w-[680px] h-[680px] bg-gradient-to-tr from-emerald-200 via-cyan-200 to-lime-200 rounded-full blur-[180px] opacity-70" />
        <div className="absolute bottom-[-260px] right-[-180px] w-[720px] h-[720px] bg-gradient-to-bl from-amber-200 via-teal-200 to-violet-200 rounded-full blur-[190px] opacity-60" />
      </div>
      <BackgroundChartPattern opacity={0.12} />

      {/* Navbar */}
      <Navbar />

      {/* Main */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-start px-6 pt-[calc(var(--nav-h)+8px)] md:pt-[calc(var(--nav-h)+12px)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl text-center"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 via-teal-600 to-lime-600">AutoSense Analytics</span>
          </h1>
          {/* Platform description under title */}
          <div className="mt-6 max-w-3xl mx-auto space-y-2 text-gray-600">
            <p className="text-lg md:text-xl leading-relaxed">AutoSense Analytics is an AI‑powered data platform that turns spreadsheets into elegant, actionable dashboards—no manual setup required.</p>
            <p className="text-lg md:text-xl leading-relaxed">Upload CSV/XLSX to get auto‑generated charts, insights, and one‑click exports that accelerate decision‑making.</p>
          </div>

          {/* Upload (unboxed) */}
          <div id="upload" className="mt-10 w-full max-w-2xl mx-auto scroll-mt-24">
            <UploadCard />
          </div>

          {/* Feature highlights */}
          <motion.div id="features" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-2 scroll-mt-24">
            {[
              { title: "AI Charting", desc: "Automatic visuals from CSV/Excel in seconds." },
              { title: "Export Suite", desc: "PDF/JPG export ready for reporting and sharing." },
              { title: "BI Ready", desc: "Use outputs in Power BI or Tableau easily." },
            ].map((f) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="group relative rounded-2xl border border-neutral-200/70 bg-white/70 backdrop-blur-md p-6 shadow-sm hover:shadow-xl transition-all"
              >
                <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_60%)]" />
                <h3 className="relative z-10 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="relative z-10 mt-3 text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Gallery */}
          <div id="gallery" className="scroll-mt-24">
            <DashboardGallery />
          </div>

          {/* Chart preview strip */}
          <div id="showcase" className="mt-16 w-full scroll-mt-24">
            <div className="relative rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-xl p-4 shadow-md overflow-hidden">
              <div className="absolute -top-10 left-10 h-24 w-24 rounded-full bg-gradient-to-tr from-emerald-300 to-teal-300 blur-2xl opacity-40" />
              <div className="absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-gradient-to-tr from-lime-300 to-green-300 blur-2xl opacity-40" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Donut / Pie composition */}
                <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-4 border border-neutral-200">
                  <svg className="h-28 w-full" viewBox="0 0 300 100">
                    <g transform="translate(150,50)">
                      <circle r="28" fill="#e5f9f2" />
                      <circle r="20" fill="#fff" />
                      {/* segments via stroke-dasharray */}
                      <circle r="24" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="60 120" transform="rotate(-90)" />
                      <circle r="24" fill="none" stroke="#22d3ee" strokeWidth="8" strokeDasharray="40 140" transform="rotate(30)" />
                      <circle r="24" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="30 150" transform="rotate(120)" />
                    </g>
                  </svg>
                  <p className="mt-3 text-sm text-gray-700">Donut Composition</p>
                </div>

                {/* Scatter relationships */}
                <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-white p-4 border border-neutral-200">
                  <svg className="h-28 w-full" viewBox="0 0 300 100">
                    <defs>
                      <linearGradient id="scatterGrad" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#0ea5a3" />
                      </linearGradient>
                    </defs>
                    <rect x="20" y="20" width="260" height="60" rx="8" fill="#f8ffff" />
                    {[
                      [40,70],[60,55],[80,62],[95,40],[120,52],[140,45],[160,35],[175,60],[195,50],[215,30],[235,42],[255,48]
                    ].map(([x,y],i)=> (
                      <circle key={i} cx={x} cy={y} r="3" fill="url(#scatterGrad)" />
                    ))}
                  </svg>
                  <p className="mt-3 text-sm text-gray-700">Scatter Relationships</p>
                </div>

                {/* Radar KPIs */}
                <div className="rounded-2xl bg-gradient-to-br from-lime-50 to-white p-4 border border-neutral-200">
                  <svg className="h-28 w-full" viewBox="0 0 300 100">
                    <g transform="translate(150,50)">
                      {[
                        [32,0],
                        [16,28],
                        [-16,28],
                        [-32,0],
                        [-16,-28],
                        [16,-28],
                      ].map(([x,y],i) => (
                        <line key={i} x1="0" y1="0" x2={x} y2={y} stroke="#e5e7eb" />
                      ))}
                      <polygon points="32,0 16,27 -12,22 -22,-12 8,-26 28,-8" fill="#10b98122" stroke="#10b981" />
                      <circle r="34" fill="none" stroke="#e5e7eb" />
                    </g>
                  </svg>
                  <p className="mt-3 text-sm text-gray-700">Radar KPI Coverage</p>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div id="how-it-works" className="mt-20 w-full scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">How it works</h2>
            <p className="text-gray-600 text-center mt-2">Upload. Analyze. Visualize. All in minutes.</p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Upload",
                  desc: "Drop your CSV/XLSX or browse from device.",
                  grad: "from-emerald-500 to-teal-500",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
                {
                  title: "Analyze",
                  desc: "AI detects schema, relationships, and insights.",
                  grad: "from-cyan-500 to-emerald-500",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 12h4v8H3v-8zm7-5h4v13h-4V7zm7-3h4v16h-4V4z" fill="currentColor" />
                    </svg>
                  ),
                },
                {
                  title: "Visualize",
                  desc: "Stunning dashboards and exports in one click.",
                  grad: "from-amber-500 to-lime-600",
                  icon: (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 19h16M5 17l4-4 3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <div key={s.title} className="relative rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-md p-6 shadow-sm">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${s.grad} text-white flex items-center justify-center shadow-md`}>{s.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                  <p className="mt-2 text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integrations & formats */}
          <div id="integrations" className="mt-16 w-full scroll-mt-24">
            <div className="rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-md px-6 py-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-700">
                <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">CSV</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">XLSX</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">PDF Export</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">JPG Export</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">Power BI</span>
                <span className="px-3 py-1 rounded-full border border-neutral-200 bg-white">Tableau</span>
              </div>
            </div>
          </div>

          {/* KPI counters */}
          <div id="kpis" className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 w-full scroll-mt-24">
            {[
              { k: "Files Analyzed", v: "12k+" },
              { k: "Dashboards Built", v: "3.2k" },
              { k: "Avg. Time Saved", v: "84%" },
              { k: "Exports", v: "8.7k" },
            ].map((c) => (
              <motion.div
                key={c.k}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
                className="group relative rounded-2xl border border-neutral-200 bg-white/70 backdrop-blur-md p-6 text-center shadow-sm hover:shadow-xl transition-all"
              >
                <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_60%)]" />
                <div className="relative z-10 text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-cyan-600 to-teal-600">{c.v}</div>
                <div className="relative z-10 mt-1 text-sm text-gray-600">{c.k}</div>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div id="testimonials" className="mt-16 w-full scroll-mt-24">
            <div className="rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  "“Turned messy CSVs into dashboards in minutes.”",
                  "“Exported polished PDFs for the board—zero design time.”",
                  "“Ready-to-use charts straight into Power BI.”",
                ].map((q, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -6, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    className="group relative rounded-2xl border border-neutral-200 bg-white/70 p-5 shadow-sm hover:shadow-xl transition-all"
                  >
                    <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.08),transparent_60%)]" />
                    <div className="relative z-10 absolute -top-3 -left-3 h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow">“”</div>
                    <p className="relative z-10 text-sm text-gray-700 pl-6">{q}</p>
                    <div className="relative z-10 mt-3 text-xs text-gray-500 pl-6">— Product Lead</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div id="cta" className="mt-16 scroll-mt-24">
            <motion.a
              href="#upload"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("upload");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              whileHover={{ scale: 1.05, y: -2 }}
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
              <span className="relative z-10 font-semibold">Start Upload</span>
              <svg className="relative z-10" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
            <p className="mt-3 text-sm text-gray-600">CSV and Excel supported. No setup needed.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full px-6 py-6 mt-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 rounded-3xl border border-neutral-200 bg-white/70 backdrop-blur-md p-8 shadow-sm">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden shadow-md">
                  <img src="/logo_autosense.png" alt="AutoSense Logo" className="w-10 h-10 object-contain transform origin-center scale-125" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">AutoSense Analytics</div>
                  <div className="text-xs text-gray-600">Visual Intelligence, Instantly</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600">AI-powered analytics that turn CSV/XLSX into beautiful dashboards and exports.</p>
            </div>

            {/* Sections */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900">Sections</h5>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><a className="hover:text-emerald-600" href="#upload">Upload</a></li>
                <li><a className="hover:text-emerald-600" href="#features">Features</a></li>
                <li><a className="hover:text-emerald-600" href="#gallery">Gallery</a></li>
                <li><a className="hover:text-emerald-600" href="#how-it-works">How it works</a></li>
                <li><a className="hover:text-emerald-600" href="#integrations">Integrations</a></li>
              </ul>
            </div>

            {/* More */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900">More</h5>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><a className="hover:text-emerald-600" href="#showcase">Showcase</a></li>
                <li><a className="hover:text-emerald-600" href="#kpis">KPIs</a></li>
                <li><a className="hover:text-emerald-600" href="#testimonials">Testimonials</a></li>
                <li><a className="hover:text-emerald-600" href="#cta">Get Started</a></li>
              </ul>
            </div>

            {/* Stay Connected */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900">Connect</h5>
              <p className="mt-3 text-sm text-gray-600">Follow updates and releases.</p>
              <div className="mt-4 flex items-center gap-3">
                <a aria-label="GitHub" href="https://github.com/Madhu-014" target="_blank" rel="noopener noreferrer" className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-gray-700 hover:text-emerald-600 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.07-.63.07-.63 1.02.07 1.56 1.07 1.56 1.07.9 1.57 2.36 1.12 2.93.86.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.09 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32 .1-2.74 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 2.5-.34c.85 0 1.7.11 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.48 .1 2.74 .64.72 1.03 1.63 1.03 2.75 0 3.96-2.34 4.83-4.57 5.09 .36.32 .68.95 .68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27 .18 .6 .69 .49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/>
                  </svg>
                </a>
                <a aria-label="LinkedIn" href="https://www.linkedin.com/in/madhusudhan-chandar-581b49309/" target="_blank" rel="noopener noreferrer" className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-gray-700 hover:text-emerald-600 shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.94 7.5A2.19 2.19 0 1 1 6.93 3a2.19 2.19 0 0 1 0 4.5ZM3.75 21h6.39V9.75H3.75V21Zm8.11 0h6.39v-6.22c0-3.32-1.77-4.86-4.12-4.86-1.9 0-2.75 1.05-3.22 1.8v-1.56h-3.05V21h3.05v-5.8c0-1.53 .29-3.01 2.19-3.01 1.86 0 1.89 1.74 1.89 3.1V21Z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} AutoSense Analytics</span>
              <span className="hidden md:inline">•</span>
              <span>
                Developed by <span className="font-medium text-gray-900">Madhusudhan Chandar</span>
              </span>
            </div>
            <div className="mt-3 md:mt-0 flex items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                Export: PDF • JPG
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[11px] text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-teal-500" />
                BI: Power BI • Tableau
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
