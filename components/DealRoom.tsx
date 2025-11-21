import React, { useState } from 'react';
import { Job, Recommendation } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { tailorResume } from '../services/geminiService';

interface DealRoomProps {
  job: Job | null;
  onClose: () => void;
  resumeText?: string;
}

const DealRoom: React.FC<DealRoomProps> = ({ job, onClose, resumeText }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'tailor'>('details');
  const [tailoredResume, setTailoredResume] = useState<string>("");
  const [isTailoring, setIsTailoring] = useState(false);

  if (!job || !job.analysis || !job.financials) return null;

  const { analysis, financials } = job;

  // Transform data for BarChart
  const currentSalaryAvg = (job.salaryMin + job.salaryMax) / 2;
  const chartData = [
    { name: 'Junior', salary: 110000, isJob: false },
    { name: 'Mid-Level', salary: 135000, isJob: false },
    { name: 'This Role', salary: currentSalaryAvg, isJob: true },
    { name: 'Senior', salary: 160000, isJob: false },
    { name: 'Lead', salary: 190000, isJob: false },
    { name: 'Principal', salary: 210000, isJob: false },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400 border-green-400";
    if (score >= 50) return "text-yellow-400 border-yellow-400";
    return "text-red-400 border-red-400";
  };

  const getRecColor = (rec: Recommendation) => {
    switch (rec) {
      case Recommendation.APPLY: return "bg-green-600";
      case Recommendation.NETWORK_FIRST: return "bg-blue-600";
      case Recommendation.AVOID: return "bg-red-600";
    }
  };

  const handleTailorResume = async () => {
    if (!resumeText) return;
    setIsTailoring(true);
    const result = await tailorResume(job, resumeText);
    setTailoredResume(result);
    setIsTailoring(false);
  };

  const openJobLink = () => {
    // In a real app, this would be job.url. Using Google Search as fallback since mock data has no URLs.
    const url = `https://www.google.com/search?q=${encodeURIComponent(job.title + " " + job.company + " jobs")}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-950">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{job.title}</h2>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {job.location}
              </span>
              <span className="text-emerald-400 font-mono">
                ${(job.salaryMin/1000).toFixed(0)}k - ${(job.salaryMax/1000).toFixed(0)}k
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
                onClick={openJobLink}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm font-medium transition-colors"
            >
                <span>View Job Posting</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </button>
            
            <div className="flex flex-col items-end gap-2">
                <button onClick={onClose} className="text-slate-400 hover:text-white mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <span className={`px-4 py-1 rounded-full text-sm font-bold text-white ${getRecColor(analysis.recommendation)}`}>
                {analysis.recommendation}
                </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-6">
          <button 
            onClick={() => setActiveTab('details')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Deal Analysis
          </button>
          <button 
            onClick={() => setActiveTab('tailor')}
            className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tailor' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            AI Resume Tailor
          </button>
        </div>

        {/* Content Grid */}
        {activeTab === 'details' ? (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* Left Column: AI Analysis */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Verdict Card */}
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-xl font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  AI Growth Verdict
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {analysis.growth_verdict}
                </p>
              </div>

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Strengths & Weaknesses</h3>
                  <ul className="space-y-3">
                    {analysis.pros_cons.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300">
                        <span className="text-indigo-500 mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Job Description Snippet */}
              <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-slate-400 mb-2">Source Description</h3>
                <div className="text-slate-500 text-sm whitespace-pre-line h-48 overflow-y-auto">
                  {job.description}
                </div>
              </div>

            </div>

            {/* Right Column: Stats & Financials */}
            <div className="space-y-6">
              
              {/* Fit Score */}
              <div className={`bg-slate-900 rounded-xl p-8 border-2 flex flex-col items-center justify-center ${getScoreColor(analysis.fit_score)}`}>
                <span className="text-6xl font-black tracking-tighter">{analysis.fit_score}</span>
                <span className="text-sm uppercase tracking-widest opacity-80">Match Score</span>
              </div>

              {/* Financial Data */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Financial Intelligence</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span className="text-slate-400">Symbol</span>
                    <span className="text-white font-mono">{financials.symbol || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span className="text-slate-400">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${financials.isPrivate ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                      {financials.isPrivate ? "Private" : "Public"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                    <span className="text-slate-400">Market Cap</span>
                    <span className="text-white font-mono">{financials.marketCap}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Rev Growth (YoY)</span>
                    <span className={`font-mono font-bold ${financials.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(financials.revenueGrowth * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Compensation Chart */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 h-64">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Salary vs. Market</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 11}} />
                    <YAxis stroke="#94a3b8" tickFormatter={(val) => `$${val/1000}k`} />
                    <Tooltip 
                        cursor={{fill: '#1e293b', opacity: 0.4}} 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Salary']}
                    />
                    <Bar dataKey="salary" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isJob ? '#34d399' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-6 animate-fadeIn">
            <div className="mb-6 flex justify-between items-center">
              <div>
                 <h3 className="text-xl font-bold text-white">Tailor Resume to Job</h3>
                 <p className="text-slate-400 text-sm mt-1">AI will rewrite your summary and bullets to match this job description.</p>
              </div>
              <button 
                onClick={handleTailorResume}
                disabled={isTailoring || !resumeText}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTailoring ? (
                  <>
                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Rewriting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Generate Tailored Version
                  </>
                )}
              </button>
            </div>
            
            <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-hidden">
               {tailoredResume ? (
                 <textarea 
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-300 font-mono text-sm resize-none"
                    value={tailoredResume}
                    readOnly
                 />
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <p>Ready to generate tailored content</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealRoom;