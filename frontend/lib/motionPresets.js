export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

export const hoverLift = { whileHover: { y: -4 } };

export const glowPulse = {
  hidden: { opacity: 0 },
  visible: { opacity: 0.7, transition: { repeat: Infinity, duration: 6 } },
};