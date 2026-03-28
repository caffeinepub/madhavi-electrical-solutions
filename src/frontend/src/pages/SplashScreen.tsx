import { Zap } from "lucide-react";
import { motion } from "motion/react";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Radial glow behind icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-electric opacity-5 blur-3xl" />
      </div>

      <motion.div
        className="relative flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Icon badge */}
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-2xl bg-electric shadow-electric"
          animate={{
            boxShadow: [
              "0 0 20px oklch(0.87 0.19 90 / 0.4)",
              "0 0 48px oklch(0.87 0.19 90 / 0.7)",
              "0 0 20px oklch(0.87 0.19 90 / 0.4)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Zap
            className="h-10 w-10 text-primary-foreground"
            fill="currentColor"
          />
        </motion.div>

        {/* Logo text */}
        <div className="text-center">
          <motion.h1
            className="font-display text-4xl font-extrabold uppercase tracking-[0.18em] text-electric sm:text-5xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            MES Infratech
          </motion.h1>
          <motion.p
            className="mt-2 font-body text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground sm:text-base"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            Madhavi Electrical Solutions
          </motion.p>
        </div>

        {/* Loading dots */}
        <motion.div
          className="flex gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-electric"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 0.9,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
