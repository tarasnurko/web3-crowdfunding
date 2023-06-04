// import { EvmAddressInput } from "moralis/common-evm-utils";
import { default as abi } from "./abi.json";
// export const contractAddress: EvmAddressInput =
//   "0x39673d50e70826e287e595da274dd67b038e7400";

const contractAddress: `0x${string}` =
  "0x892eC3A94D71c6a2d7551a39AB1C3958543d009D";

type ABI = typeof abi;

export { abi, contractAddress };
export type { ABI };
