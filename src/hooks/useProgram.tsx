import { ProgramContext } from "@/contexts/program";
import { useContext } from "react";

const useProgram = () => useContext(ProgramContext);
export default useProgram