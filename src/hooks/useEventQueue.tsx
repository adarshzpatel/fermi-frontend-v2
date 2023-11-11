import { useEventQueueStore } from "@/stores/useEventQueueStore"
import { useAnchorWallet } from "@solana/wallet-adapter-react"
import { useEffect } from "react"
import useMarket from "./useMarket"
import useFermiProgram from "./useFermiProgram"
import { PublicKey } from "@solana/web3.js"
import { parseEventQ } from "@/solana/utils"



const useEventQueue = () => {
  const {eventQ,setEventQ} = useEventQueueStore()
  const connectedWallet = useAnchorWallet()
  const {currentMarket} = useMarket()
  const {program} = useFermiProgram() 


  const fetchEventQueue = async () => {
    try{
      if(!connectedWallet) throw new Error("Wallet not connected")
      if(!currentMarket) throw new Error("Market not selected")
      if(!program) throw new Error("Program not initialized")

      const [eventQPda] = await PublicKey.findProgramAddress(
        [Buffer.from('event-q', 'utf-8'), new PublicKey(currentMarket.marketPda).toBuffer()],
        program.programId,
      );

      const eventQueueRes = await program.account.eventQueue.fetch(eventQPda);
      console.log("eventQueue",eventQueueRes) ;


      const parsedEventQueue = parseEventQ(eventQueueRes);
      setEventQ(parsedEventQueue);

    } catch(err){
      console.log("Error in fetchEventQueue",err)
    }
  }

  useEffect(()=>{
    fetchEventQueue()
  },[connectedWallet,currentMarket,program])

  return {eventQ}
 }

export default useEventQueue