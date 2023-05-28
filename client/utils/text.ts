import dayjs from "dayjs";

export const sliceWalletAddress = (
  walletAddress: string,
  startChars: number = 6,
  endChars: number = 4
) => {
  const start = walletAddress.slice(0, startChars);
  const end = walletAddress.slice(-endChars);
  return `${start}...${end}`;
};

export const sliceTitle = (text: string, maxLength: number = 34) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

export const sliceDescription = (text: string, maxLength: number = 88) => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

export const formatDeadline = (timestamp: string) => {
  dayjs(parseInt(timestamp) * 1000).format("DD-MM-YYYY");
};
