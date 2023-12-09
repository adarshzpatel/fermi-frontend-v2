import {
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import CustomWalletConnectButton from "./CustomWalletConnectButton";
import { useFermiStore } from "@/stores/fermiStore";
import OpenOrdersAccountDropdown from "./OpenOrdersAccountDropdown";
import MarketSelector from "./MarketSelector";
import { MARKETS } from "@/solana/config";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { setSelectedMarket, selectedMarket } = useFermiStore();
  const changeMarket = (marketPda: string) => {
    const params = new URLSearchParams();
    // if invalid market set to default
    const newMarket =
      MARKETS.find((it) => it.marketPda === marketPda) || MARKETS[0];

    setSelectedMarket(newMarket);
    params.set("market", newMarket.marketPda);
    router.push(`${pathname}?${params.toString()}`);
  };
  return (
    <header className="border-b-1 border-default-300 ">
      <nav className="flex ">
        <h6 className="font-semibold  p-4  flex-1 text-2xl m-auto font-heading">
          Fermi
        </h6>
          <Link href="/airdrop">Airdrop</Link>
        <OpenOrdersAccountDropdown />
        <div>
          <CustomWalletConnectButton />
        </div>
      </nav>
    </header>
  );
};

export default Header;
