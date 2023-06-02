// import { EvmAddressInput } from "moralis/common-evm-utils";
import { default as abi } from "./abi.json";
// export const contractAddress: EvmAddressInput =
//   "0x39673d50e70826e287e595da274dd67b038e7400";

const contractAddress: `0x${string}` =
  "0x39673d50e70826e287e595da274dd67b038e7400";

type ABI = typeof abi;

export { abi, contractAddress };
export type { ABI };
