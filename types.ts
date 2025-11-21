import { Type } from "@google/genai";

export enum Recommendation {
  APPLY = "Apply",
  AVOID = "Avoid",
  NETWORK_FIRST = "Network First"
}

export interface Financials {
  symbol: string;
  price: number;
  revenueGrowth: number; // Percentage
  isPrivate: boolean;
  marketCap: string;
}

export interface AiAnalysis {
  fit_score: number;
  recommendation: Recommendation;
  pros_cons: string[];
  growth_verdict: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  postedDate: string; // ISO string
  description: string;
  salaryMin: number;
  salaryMax: number;
  source: 'LinkedIn' | 'Indeed' | 'Glassdoor';
  financials?: Financials;
  analysis?: AiAnalysis;
  status: 'scraped' | 'enriching' | 'analyzing' | 'complete';
}

export interface SearchCriteria {
  jobTitle: string;
  location: string;
  isRemote: boolean;
  resumeText: string;
}
