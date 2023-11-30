import Chart from "@/components/Chart";
import Layout from "@/components/Layout";
import OpenOrders from "@/components/OpenOrdersTable";
import Orderbook from "@/components/Orderbook";
import PlaceOrder from "@/components/PlaceOrder";
import { MARKETS } from "@/solana/config";
import { Input, Link, Select, SelectItem } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";

import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <Layout>
      <Link href="/trade">Start Trading</Link>  
    </Layout>
  );
}
