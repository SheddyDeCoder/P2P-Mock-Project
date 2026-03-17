"use client"

import Link from "next/link"
import { Button } from "@/components/layout/ui/Button"
import { motion } from "framer-motion"

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,200,0,0.15),_transparent_60%)]" />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center gap-8 pt-32 pb-24 px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight max-w-4xl"
        >
          The Future of{" "}
          <span className="text-primary">Decentralized P2P</span>{" "}
          Trading
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-muted-foreground max-w-2xl text-lg"
        >
          Secure escrow protection. Instant peer matching.
          Trade crypto and digital assets safely with next-generation Web3 security.
          <span className="block mt-2 text-primary font-medium">
            No KYC. No account required to trade.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          {/* ← Changed from /trades to /offers */}
          <Link href="/offers">
            <Button size="lg" className="shadow-lg shadow-primary/30">
              Start Trading
            </Button>
          </Link>

          <Link href="/auth/register">
            <Button size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="text-muted-foreground text-xs"
        >
          Want to create offers, swap, or manage your wallet?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Login here
          </Link>
        </motion.p>
      </section>

      {/* FEATURES SECTION */}
      <section className="grid md:grid-cols-3 gap-8 px-6 pb-32 max-w-6xl mx-auto">
        {[
          {
            title: "Decentralized Escrow",
            desc: "Funds are locked securely until both parties confirm the trade."
          },
          {
            title: "No KYC Required",
            desc: "Trade freely without identity verification. Just browse offers and start trading instantly."
          },
          {
            title: "Web3 Security",
            desc: "Built with modern architecture and blockchain principles."
          }
        ].map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="p-8 rounded-2xl bg-card border backdrop-blur-xl transition-all"
          >
            <h3 className="text-xl font-semibold mb-4 text-primary">
              {feature.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </section>

      {/* STATS SECTION */}
      <section className="border-t border-border py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <h2 className="text-4xl font-bold text-primary">10K+</h2>
            <p className="text-muted-foreground">Trades Completed</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-primary">5K+</h2>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-primary">$2M+</h2>
            <p className="text-muted-foreground">Volume Processed</p>
          </div>
        </div>
      </section>

    </div>
  )
}