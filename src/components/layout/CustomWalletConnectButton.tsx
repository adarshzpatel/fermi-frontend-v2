import useSolBalance from "@/hooks/useSolBalance";
import { useFermiStore } from "@/stores/fermiStore";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useWalletMultiButton } from "@solana/wallet-adapter-base-ui";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TbArrowsExchange2, TbCopy, TbLogout } from "react-icons/tb";

const CustomWalletConnectButton = () => {
  const connectedWallet = useAnchorWallet()
  const {connection} = useConnection()
  const { disconnect } = useWallet();
  const { solBalance } = useSolBalance();
  const { setVisible: setModalVisible } = useWalletModal();
  const { buttonState, onConnect, publicKey } = useWalletMultiButton({
    onSelectWallet() {
      setModalVisible(true);
    },
  });
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLUListElement>(null);
  
  const connectClientWithWallet = useFermiStore(state => state.actions.connectClientWithWallet)
  
  useEffect(()=>{
    if(connectedWallet){
      connectClientWithWallet(connectedWallet)
    }
  },[connectedWallet])

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

  const handleDisconnect = useCallback(() => {
    disconnect().catch(() => {
      // Silently catch because any errors are caught by the context `onError` handler
    });
  }, [disconnect]);



  const content = useMemo(() => {
    if (publicKey) {
      const base58 = publicKey.toBase58();
      return base58.slice(0, 4) + "..." + base58.slice(-4);
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
      <Dropdown
        showArrow
        radius="none"
        classNames={{

          base: "py-1 px-1 border  style-card dark:to-black",
          arrow: "bg-default-200",
        }}
      >
        {buttonState === "connected" ? (
          <DropdownTrigger className="hover:bg-default-50 duration-200 ease-out p-4 border-l border-default-300 cursor-pointer">
            <div>
              <p className="text-default-400 text-xs">Connected Wallet</p>
              <div className="flex gap-2 items-center">
                <p className="font-medium hidden sm:block">
                  {solBalance && (solBalance / 1000000000).toFixed(4) + " SOL "}
                </p>
                <div className="h-4 w-[1px] bg-default-400"></div>
                <p className="">{content}</p>
              </div>
            </div>
          </DropdownTrigger>
        ) : (
          <button
            onClick={() => {
              console.log(buttonState);
              setModalVisible(true);
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

            className="hover:bg-default-50 h-full duration-200 ease-out p-4 border-l border-default-300 cursor-pointer"
          >
            {content}
          </button>
        )}
        <DropdownMenu
          variant="faded"

          aria-label="Wallet dropdown with options to change wallet and disconnect"
        >
          <DropdownItem
            closeOnSelect={false}
            startContent={<TbCopy className="h-5 w-5" />}
            onClick={async () => {
              await navigator.clipboard.writeText(publicKey?.toBase58() ?? "");
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
            onClick={() => handleDisconnect()}
            key="disconnect"
          >
            Disconnect
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </>
  );
};

export default CustomWalletConnectButton;
