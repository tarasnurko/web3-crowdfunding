import { ENV } from "@/utils/env";
import { MoralisNextApi } from "@moralisweb3/next";

export default MoralisNextApi({ apiKey: ENV.MORALIS_API_KEY });
