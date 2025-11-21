import { Job, Financials } from '../types';

// Mock data for simulation
const MOCK_COMPANIES = [
  { name: "TechFlow Systems", symbol: "TFS", price: 142.50, growth: 0.15, private: false, cap: "12B" },
  { name: "SalesForce Dynamics", symbol: "CRM", price: 290.10, growth: 0.11, private: false, cap: "280B" },
  { name: "StartupX", symbol: "", price: 0, growth: 0, private: true, cap: "N/A" },
  { name: "OmniCorp Global", symbol: "OCG", price: 45.20, growth: -0.02, private: false, cap: "4B" },
  { name: "CloudScale AI", symbol: "CSAI", price: 88.00, growth: 0.45, private: false, cap: "2B" },
];

const JOB_TITLES = [
  "Director of Sales Engineering",
  "Technical Account Manager",
  "Solutions Architect",
  "Enterprise Account Executive (SaaS)",
  "Head of Growth"
];

const LOCATIONS = ["San Francisco, CA", "New York, NY", "Austin, TX", "Remote", "London, UK"];

// Simulate scraping delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateMockJob = (criteria: { jobTitle: string, location: string, isRemote: boolean }): Job => {
  const companyData = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
  const title = criteria.jobTitle || JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)];
  const location = criteria.isRemote ? "Remote" : (criteria.location || LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]);
  
  return {
    id: Math.random().toString(36).substring(7),
    title: title,
    company: companyData.name,
    location: location,
    isRemote: criteria.isRemote,
    postedDate: new Date().toISOString(),
    description: `
      We are seeking a ${title} to join our team at ${companyData.name}. 
      
      Responsibilities:
      - Bridge the gap between technical teams and commercial sales.
      - Drive revenue growth through technical demonstrations.
      - Manage key enterprise relationships.
      
      Requirements:
      - 5+ years in technical sales or solution architecture.
      - Strong understanding of cloud infrastructure.
      - Proven track record of meeting quotas.
      
      Benefits:
      - Competitive salary and equity.
      - Remote work options.
    `,
    salaryMin: 120000 + Math.floor(Math.random() * 50000),
    salaryMax: 180000 + Math.floor(Math.random() * 100000),
    source: Math.random() > 0.5 ? 'LinkedIn' : 'Indeed',
    status: 'scraped'
  };
};

export const enrichJobWithFinancials = async (job: Job): Promise<Job> => {
  await delay(800); // Simulate API latency to FMP
  
  const companyData = MOCK_COMPANIES.find(c => c.name === job.company) || MOCK_COMPANIES[2]; // Fallback to private

  const financials: Financials = {
    symbol: companyData.private ? "PVT" : companyData.symbol,
    price: companyData.price,
    revenueGrowth: companyData.growth,
    isPrivate: companyData.private,
    marketCap: companyData.cap
  };

  return {
    ...job,
    financials,
    status: 'analyzing' // Ready for next step
  };
};
