export interface StockCompany {
  name: string;
  sector?: string;
  industry?: string;
  exchange?: string;
  country?: string;
  currency?: string;
  description?: string;
  website?: string;
  logo?: string;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  previousPrice: number | null;
  priceChange: number;
  volume: number;
  lastUpdate?: string;
  conditions?: string[];
  company: StockCompany | null;
}