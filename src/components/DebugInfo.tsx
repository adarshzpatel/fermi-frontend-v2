import { selectedMarketSelector, useFermiStore } from "@/stores/fermiStore";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import React, { useEffect } from "react";

type Props = {};

const DebugInfo = (props: Props) => {
  const store = useFermiStore();
  const connectedWallet = useAnchorWallet();
  return (
    <div className="style-card m-4 mb-0 p-4">
      <h6 className="font-heading font-medium mb-1">DEBUG VALUES</h6>
      <p>
        Connected Wallet :{" "}
        {connectedWallet?.publicKey.toString() || "Not connected"}
      </p>

      <p>Current Market : {store.selectedMarket.publicKey?.toString()}</p>
      <p>Open orders Account : {store.openOrders.publicKey?.toString()}</p>
    </div>
  );
};

export default DebugInfo;
