import React, { useState, useEffect, useRef } from 'react';
import { Job, SearchCriteria } from './types';
import { generateMockJob, enrichJobWithFinancials } from './services/jobService';
import { analyzeJobMatch } from './services/geminiService';
import JobGrid from './components/JobGrid';
import DealRoom from './components/DealRoom';
import ChatBot from './components/ChatBot';

const DEFAULT_RESUME = `FELIPE KIM
Austin, TX | felipekim.contact@gmail.com | 310-569-3415 | LinkedIn

SUMMARY
Dynamic program management and sales leadership executive with 10+ years of experience driving cross-functional transformations in e-commerce, supply chain, and CPG sectors. Proven track record in leading high-impact programs that optimize operations, boost revenue (e.g., +35% YoY sales growth), and enhance customer success for enterprise-scale clients. Expertise in stakeholder alignment, data-driven decision-making using SQL, Tableau, and Python, and scaling global initiatives amid ambiguity.

EXPERIENCE
AMAZON Austin, TX
Senior Program Manager, Supply Chain – US 3P (Oct 2024 – Present)
• Led end-to-end inbound supply chain architecture for 3,000+ third-party sellers, reducing FBA fees by $20M (12% YoY) via data-driven optimizations, cross-functional collaboration (engineering, product, operations), and strategic roadmaps for faster delivery and cost efficiency.
• Drove 99% in-stock rate (+25% YoY) during peak events through scalable risk mitigation, forecasting models, and stakeholder alignment, yielding 20% seller sales velocity uplift and enhanced global e-commerce performance
• Identified optimization opportunities with SQL, Tableau, and AWS QuickSight; orchestrated 30% enrollment in AWD/Supply Chain by Amazon programs, building playbooks for onboarding, adoption, and long-term partnerships to boost network efficiency.

Manager of Customer Success Managers – US 3P (Mar 2022 – Oct 2024)
• Directed category strategy and joint business planning for Consumables portfolio, generating $525M in revenue (+24% YoY) by translating shopper insights and marketplace trends into tailored seller plans, promotions, and pricing models—driving adoption and renewal through proactive enablement.
• Scaled premium product selection 38% YoY via cross-functional initiatives (sales, marketing, product); implemented health scoring, KPI frameworks, and QBRs to measure impact and influence stakeholders.
• Mentored 15 Strategic Account Managers to $1B+ sales (+35% YoY), promoting 4 to senior roles; acted as advisor for escalations, VoC integration into roadmaps, and sales expansions to accelerate retention and time-to-value.

ANHEUSER-BUSCH INBEV Various Locations
Director of Retail Sales – Craft Brands, Large Format Chains US (Oct 2020 – Mar 2022)
• Delivered 23% YoY sales growth across OMNI channels by leading strategic account engagements with national retail chains (e.g., HQ-level partnerships), developing joint business plans, volume forecasts, and promotional calendars to optimize shelf space and revenue.
• Managed cross-functional alignment with supply chain, marketing, and field sales to execute go-to-market strategies, influencing decision-makers through insights-led storytelling and syndicated data analysis (e.g., Nielsen-equivalent tools) for assortment and pricing recommendations.
• Coached a team of 6 National Account Managers across large-format, small-format, and on-premise segments, enhancing execution standards, distributor buy-in, and performance dashboards to drive mutual growth and ROI on trade investments.

Regional Sales Director – Central US Region (Mar 2019 – Oct 2020)
• Achieved 30% YoY sales growth by optimizing trade marketing programs, brand activations, and key account partnerships, leveraging analytical tools (Excel, BI platforms) to forecast demand, mitigate risks, and expand market share by 22% with 31% retail penetration gains.
• Strengthened distributor and wholesaler relationships through capacity planning and resource allocation, building scalable processes that improved sales velocity and aligned with enterprise-level supply chain efficiencies.

Regional Sales Director – Southwest US Region (Jun 2017 – Mar 2019)
• Oversaw brand performance and sales execution for 18% revenue growth via market-specific strategies, activations, and cross-functional roadmaps, resolving trade-offs through stakeholder facilitation and data-driven prioritization.
• Directed a team of 10 Regional Sales Managers, driving operational optimizations and training programs that enhanced productivity, shelf visibility, and compliance with promotional guidelines.

Regional Sales Director – Hawaii Region (Jan 2015 – Jun 2017)
• Delivered 23% market share growth through localized trade marketing campaigns and retail programming, partnering with key accounts to influence planograms, pricing, and in-store execution for sustained volume uplift.
• Improved shelf presence by 22% across major retailers via alignment initiatives, using performance analytics to track KPIs and refine strategies for ROI maximization.

Key Account Manager – Southwest US Region (Jan 2014 – Jan 2015)
• Drove 17% revenue growth in large-format accounts through strategic promotional programs and negotiations, expanding shelf space and ensuring compliance while providing insights for category development.

Regional Sales Manager – Southern California (Mar 2010 – Jan 2014)
• Achieved 22% sales growth via trimester planning, trade programs, and event activations, building wholesaler relationships that increased sales velocity by 20% and informed broader go-to-market refinements.

EDUCATION
• Master of Business Administration (MBA): Northwestern University, Kellogg School of Management
• Bachelor of Arts in Organizational Leadership: Arizona State University
• Python Programming Certification: General Assembly
• Digital Marketing Analytics Certification: MIT Sloan School of Management

TECHNICAL SKILLS
• Data Analysis & Insights: Python, SQL, Tableau, Power BI, AWS QuickSight, Excel (Advanced)
• Program & Project Management: JIRA, Confluence, Microsoft Project (Familiarity via cross-functional exposure)
• Sales & Enablement Tools: CRM Systems, Syndicated Data Platforms (e.g., Nielsen/CMI equivalents), BI Dashboards
• Methodologies: Agile, Waterfall, Sales Processes (e.g., MEDDPICC-inspired), Risk Mitigation Frameworks`;

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isScouting, setIsScouting] = useState(false);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    jobTitle: "",
    location: "",
    isRemote: true,
    resumeText: DEFAULT_RESUME
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  
  // Workers refs to handle cancellation if needed (not fully implemented for simplicity)
  const scoutingActive = useRef(false);

  const handleScout = async () => {
    if (isScouting) return;
    setIsScouting(true);
    scoutingActive.current = true;

    // 1. Ingestion Phase (Simulate finding 5 jobs over time)
    for (let i = 0; i < 5; i++) {
      if (!scoutingActive.current) break;

      const newJob = generateMockJob(criteria);
      setJobs(prev => [newJob, ...prev]);
      
      // Process pipeline individually for each job to create "streaming" effect
      processJobPipeline(newJob);
      
      // Random delay between findings
      await new Promise(r => setTimeout(r, 800 + Math.random() * 1000));
    }
    
    setIsScouting(false);
  };

  const processJobPipeline = async (job: Job) => {
    try {
      // 2. Enrichment
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'enriching' } : j));
      const enrichedJob = await enrichJobWithFinancials(job);
      
      // Update state with enriched data
      setJobs(prev => prev.map(j => j.id === job.id ? enrichedJob : j));

      // 3. AI Analysis
      // Check if API key exists, otherwise skip or mock error
      if (process.env.API_KEY) {
        const analysis = await analyzeJobMatch(enrichedJob, criteria.resumeText);
        
        setJobs(prev => prev.map(j => j.id === job.id ? {
          ...enrichedJob,
          analysis,
          status: 'complete'
        } : j));
      } else {
        console.warn("No API KEY found for Gemini");
        setJobs(prev => prev.map(j => j.id === job.id ? { ...enrichedJob, status: 'complete' } : j)); // Finish without AI
      }
      
    } catch (e) {
      console.error("Pipeline failed for job", job.id, e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <span className="font-bold text-xl tracking-tight">Bibu<span className="text-indigo-400">AI</span></span>
          </div>
          <div className="text-xs font-mono text-slate-500">
            {isScouting ? "SYSTEM ACTIVE - INGESTING STREAM" : "SYSTEM READY"}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Mission Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Target Role</label>
                  <input 
                    type="text" 
                    value={criteria.jobTitle}
                    onChange={(e) => setCriteria({...criteria, jobTitle: e.target.value})}
                    placeholder="e.g. Solutions Architect"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Location</label>
                  <input 
                    type="text" 
                    value={criteria.location}
                    onChange={(e) => setCriteria({...criteria, location: e.target.value})}
                    placeholder="e.g. New York, NY"
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={criteria.isRemote}
                    onChange={(e) => setCriteria({...criteria, isRemote: e.target.checked})}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span className="text-sm text-slate-300">Remote Only</span>
                </div>

                <hr className="border-slate-800 my-4" />

                <div>
                  <label className="block text-xs text-slate-500 mb-1">Candidate Context (Resume Text)</label>
                  <textarea 
                    value={criteria.resumeText}
                    onChange={(e) => setCriteria({...criteria, resumeText: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-xs h-32 focus:outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
                  />
                </div>

                <button 
                  onClick={handleScout}
                  disabled={isScouting}
                  className={`
                    w-full py-3 rounded-lg font-bold uppercase text-sm tracking-wide shadow-lg transition-all
                    ${isScouting 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20 hover:shadow-indigo-900/40'}
                  `}
                >
                  {isScouting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Scouting...
                    </span>
                  ) : "Launch Scout"}
                </button>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-white">{jobs.length}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Opportunities</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">
                  {jobs.filter(j => j.analysis && j.analysis.fit_score > 75).length}
                </div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">High Fit</div>
              </div>
            </div>
          </div>

          {/* Right Panel: Grid */}
          <div className="lg:col-span-3">
             <JobGrid jobs={jobs} onJobClick={setSelectedJob} />
          </div>
        </div>
      </main>

      {/* Modals */}
      {selectedJob && (
        <DealRoom job={selectedJob} onClose={() => setSelectedJob(null)} resumeText={criteria.resumeText} />
      )}

      <ChatBot resumeText={criteria.resumeText} />

    </div>
  );
};

export default App;