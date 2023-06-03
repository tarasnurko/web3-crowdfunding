export interface Donation {
  donator: string;
  donated: bigint;
}

export interface Campaign {
  id: bigint;
  owner: string;
  title: string;
  description: string;
  image: string;
  deadline: bigint;
  amountCollected: bigint;
  closed: boolean;
  donations: Donation[];
}

export interface CreateCampaign {
  title: string;
  description: string;
  image: string;
  deadline: number;
}

export interface CreateCampaignForm {
  title: string;
  description: string;
  image: string;
  deadline: Date;
}

// export type PaginatedCampaigns = [string, string, string, Campaign[]];
export interface PaginatedCampaigns {
  campaigns: Campaign[];
  limit: bigint;
  page: bigint;
  total: bigint;
}
