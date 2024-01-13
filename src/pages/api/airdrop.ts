
import { createAssociatedTokenAccount, mintTo } from '@/solana/utils/helpers';
import { AnchorProvider,  Wallet } from '@coral-xyz/anchor';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import type { NextApiRequest, NextApiResponse } from 'next'

const OWNER_KEYPAIR = Keypair.fromSecretKey(
  Uint8Array.from([
    1, 60, 46, 125, 82, 22, 178, 15, 93, 247, 249, 207, 76, 156, 177, 42, 124,
    17, 225, 67, 204, 111, 68, 38, 71, 16, 206, 114, 165, 219, 70, 72, 134, 112,
    118, 222, 227, 101, 128, 158, 70, 17, 179, 29, 31, 208, 236, 211, 12, 89,
    41, 84, 52, 209, 127, 51, 144, 164, 103, 219, 20, 253, 3, 158,
  ])
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const destinationAddress = req.body?.destinationAddress;
  const mint = req.body?.mint;
  const amount = Number(req.body?.amount);
  if(!destinationAddress || !mint || !amount) res.status(500).send("Invalid inputs");
  
  const destination = new PublicKey(destinationAddress);
  const wallet = new Wallet(OWNER_KEYPAIR);
  const connection = new Connection("https://api.devnet.solana.com",{commitment:'confirmed'});
  const provider = new AnchorProvider(connection,wallet,AnchorProvider.defaultOptions());

  const authorityCoinTokenAccount: PublicKey = await getAssociatedTokenAddress(
    new PublicKey(mint),
    destination,
    false,
  );

  if (!(await connection.getAccountInfo(authorityCoinTokenAccount))) {
    console.log("Coin ATA not found , creating ... ")
    await createAssociatedTokenAccount(
      provider,
      new PublicKey(mint),
      authorityCoinTokenAccount,
      destination
    );
    console.log("Created COIN ATA")
  }

  await mintTo(
    provider,
    new PublicKey(mint),
    authorityCoinTokenAccount,
    BigInt(amount)
  );
  console.log("MINTED")

  res.status(200).json({ message:"SUCESS" })
}