import { ENV } from "@/utils";
import { MoralisNextApi } from "@moralisweb3/next";

console.log(ENV);

export default MoralisNextApi({ apiKey: ENV.MORALIS_API_KEY });
