import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import CustomWalletConnectButton from "./CustomWalletConnectButton";

const Header = () => {
  return (
    <Navbar maxWidth="xl" isBlurred isBordered className="bg-black/25">
      <NavbarBrand className="font-semibold  text-2xl font-heading">
        Fermi
      </NavbarBrand>
      <NavbarContent justify="end">
        <NavbarItem>
          <CustomWalletConnectButton />
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default Header;
