import {
  Link,
} from "@nextui-org/react";
import CustomWalletConnectButton from "./CustomWalletConnectButton";
import OpenOrdersAccountDropdown from "./OpenOrdersAccount";

const Header = () => {
  return (
    <header className="border-b-1 border-default-300 ">
      <nav className="flex ">
        <h6 className="font-semibold  p-4  flex-1 text-2xl m-auto font-heading">
          Fermi
        </h6>
        <div className="p-4 flex hover:bg-default-100/50 cursor-pointer items-center justify-center border-l border-default-300">
          <Link color="foreground" href="/airdrop">Airdrop</Link>
        </div>
        <div className="p-4 flex hover:bg-default-100/50 cursor-pointer items-center justify-center border-l border-default-300">
          <Link color="foreground" href="/trade">Trade</Link>
        </div>
        <OpenOrdersAccountDropdown />
        <div>
          <CustomWalletConnectButton />
        </div>
      </nav>
    </header>
  );
};

export default Header;
