import { useFermiStore } from "@/stores/fermiStore";
import { useEffect } from "react";
import useProvider from "./useProvider";

const useFermiClient = () => {
  const initClient = useFermiStore(state => state.actions.initClient)
  const client = useFermiStore(state => state.client);
  const provider = useProvider();


  useEffect(()=>{
    if(client){
      console.log("Client already initialized")
    }else{
      if(provider){
        initClient(provider)
      } else {
        console.log("Provider not initialized")
      }
    }
  },[])


  return client 
}

export default useFermiClient

