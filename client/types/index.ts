export interface Donation {
  donator: string;
  donated: string;
}

export interface Campaign {
  id: string;
  owner: string;
  title: string;
  description: string;
  image: string;
  deadline: string;
  amountCollected: string;
  closed: boolean;
  donations: Donation[];
}

export interface CreateCampaign {
  title: string;
  description: string;
  image: string;
  deadline: string;
}

// export type PaginatedCampaigns = [string, string, string, Campaign[]];
export interface PaginatedCampaigns {
  campaigns: Campaign[];
  limit: bigint;
  page: bigint;
  total: bigint;
}
