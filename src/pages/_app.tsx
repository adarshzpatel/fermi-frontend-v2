import "@/styles/globals.css";
import { Spinner } from "@nextui-org/react";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function App({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <motion.div
        layout
        animate={{ opacity: [0.5,1] }}

        transition={{
          opacity: { ease: "linear" },
          layout: { duration: 0.5 },
        }}
        className="h-screen text-default-500 bg-gradient-to-b from-background to-default-50 flex flex-col items-center justify-center gap-4 w-screen"
      >
        <Spinner size="lg" color="current" />
        Loading...
      </motion.div>
    );
  }
  return <Component {...pageProps} />;
}
