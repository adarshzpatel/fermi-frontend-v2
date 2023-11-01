import useSolBalance from "@/hooks/useSolBalance";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { WalletModal, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { TbArrowsExchange2, TbCopy, TbLogout } from "react-icons/tb";

const CustomWalletConnectButton = () => {
  const {solBalance} = useSolBalance();
  const { setVisible: setModalVisible } = useWalletModal();
  const {
    buttonState,
    onConnect,
    onDisconnect,
    publicKey,

  } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return;

      setMenuOpen(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, []);

  const content = useMemo(() => {
    if (publicKey) {
      const base58 = publicKey.toBase58();
      return base58.slice(0, 4) + "..." + base58.slice(-4) 
    } else if (buttonState === "connecting") {
      return "Connecting...";
    } else if (buttonState === "has-wallet") {
      return "Connect";
    } else if (buttonState === "no-wallet") {
      return "Select Wallet";
    }
  }, [buttonState, publicKey]);
  return (
    <>

      {buttonState === "connected" ? (
        <Dropdown
          backdrop="blur"
          showArrow
          classNames={{
            base: "py-1 px-1 border  style-card dark:to-black",
            arrow: "bg-default-200",
          }}
        >
          <DropdownTrigger>
            <Button  className="style-card" radius="full" > <span className="font-medium hidden sm:block">{solBalance && ((solBalance/1000000000).toFixed(4) + " SOL | ")} </span>{content}</Button>
          </DropdownTrigger>
          <DropdownMenu
            variant="faded"
            aria-label="Wallet dropdown with options to change wallet and disconnect"
          >
            <DropdownItem
              closeOnSelect={false}
              startContent={<TbCopy className="h-5 w-5" />}
              onClick={async () => {
                await navigator.clipboard.writeText(
                  publicKey?.toBase58() ?? ""
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 400);
              }}
              key="copy_address"
            >
              {copied ? "Copied" : "Copy Address"}
            </DropdownItem>
            <DropdownItem
              startContent={<TbArrowsExchange2 className="h-5 w-5" />}
              onClick={() => setModalVisible(true)}
              key="change_wallet"
            >
              Change wallet
            </DropdownItem>
            <DropdownItem
              className="text-red-500"
              startContent={<TbLogout className="h-5 w-5" />}
              onClick={() => onDisconnect && onDisconnect()}
              key="disconnect"
            >
              Disconnect
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Button
          onClick={() => {
            console.log(buttonState)
            setModalVisible(true)
            switch (buttonState) {
              case "no-wallet":
                setModalVisible(true);
                break;
              case "has-wallet":
                if (onConnect) {
                  onConnect();
                }
                break;
            }
          }}
          aria-expanded={menuOpen}
          radius="full"
        >
          {content}
        </Button>
      )}
    </>
  );
};

export default CustomWalletConnectButton;