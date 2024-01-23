import Layout from "@/components/layout/Layout";
import { MARKETS } from "@/solana/config";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter()
  return router.push("/trade?market="+MARKETS[0].marketPda)
  return (
    <Layout>
      <section className="items-center justify-center flex ">
        <div className="relative items-center w-full px-5 py-12 mx-auto lg:px-16 max-w-7xl md:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <div>
              <p className="mt-8 text-3xl font-extrabo  ld tracking-tight text-white lg:text-6xl">
                Welcome to Fermi Dex
              </p>
              <p className="max-w-xl mx-auto mt-8 text-base lg:text-xl text-slate-300">
                The portal to a new dimension of on-chain liquidity abstraction
                and just-in-time order settlement.
              </p>
            </div>
            <div className="flex flex-col justify-center max-w-sm gap-3 mx-auto mt-10 sm:flex-row">
              <Link
                href="/trade"
                className="text-white focus:outline-none inline-flex items-center justify-center rounded-xl bg-blue-500 duration-200 focus-visible:outline-black focus-visible:ring-black font-medium lg:w-auto px-6 py-3 text-center w-full"
              >
                Start Trading
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
