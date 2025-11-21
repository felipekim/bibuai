import React from 'react';
import { Job, Recommendation } from '../types';

interface JobGridProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

const JobGrid: React.FC<JobGridProps> = ({ jobs, onJobClick }) => {
  
  const getStatusBadge = (job: Job) => {
    if (job.status === 'scraped') return <span className="text-xs animate-pulse text-slate-400">Wait...</span>;
    if (job.status === 'enriching') return <span className="text-xs text-blue-400 animate-pulse">Enriching...</span>;
    if (job.status === 'analyzing') return <span className="text-xs text-purple-400 animate-pulse">AI Thinking...</span>;
    
    if (job.analysis) {
       const score = job.analysis.fit_score;
       let color = "bg-red-500/20 text-red-400 border-red-500/50";
       if (score > 75) color = "bg-green-500/20 text-green-400 border-green-500/50";
       else if (score > 50) color = "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
       
       return (
         <span className={`px-2 py-0.5 rounded border text-xs font-bold ${color}`}>
           {score} / 100
         </span>
       );
    }
    return null;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900/50">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-slate-950 text-slate-200 uppercase text-xs font-semibold tracking-wider">
          <tr>
            <th className="px-6 py-4">Company</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Location</th>
            <th className="px-6 py-4">Financials</th>
            <th className="px-6 py-4">AI Verdict</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {jobs.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-600 italic">
                No opportunities scouted yet. Configure criteria and launch scout.
              </td>
            </tr>
          )}
          {jobs.map((job) => (
            <tr 
              key={job.id} 
              onClick={() => job.status === 'complete' && onJobClick(job)}
              className={`
                transition-colors duration-150
                ${job.status === 'complete' ? 'hover:bg-slate-800 cursor-pointer' : 'opacity-70'}
              `}
            >
              <td className="px-6 py-4 font-medium text-white">
                {job.company}
                {job.financials?.isPrivate && <span className="ml-2 text-[10px] bg-slate-700 px-1 rounded text-slate-300">PVT</span>}
              </td>
              <td className="px-6 py-4 text-slate-300">{job.title}</td>
              <td className="px-6 py-4">
                {job.isRemote ? (
                   <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-900 text-indigo-200">
                     Remote
                   </span>
                ) : job.location}
              </td>
              <td className="px-6 py-4 font-mono">
                 {job.financials ? (
                   <span className={job.financials.revenueGrowth > 0 ? "text-emerald-400" : "text-rose-400"}>
                     {job.financials.revenueGrowth > 0 ? "+" : ""}{(job.financials.revenueGrowth * 100).toFixed(0)}%
                   </span>
                 ) : <span className="text-slate-600">-</span>}
              </td>
              <td className="px-6 py-4">
                 {getStatusBadge(job)}
              </td>
              <td className="px-6 py-4 text-right">
                {job.status === 'complete' ? (
                  <button className="text-indigo-400 hover:text-indigo-300 font-medium text-xs uppercase tracking-wide">
                    View Deal
                  </button>
                ) : (
                  <div className="h-1 w-12 bg-slate-700 rounded overflow-hidden ml-auto">
                    <div className="h-full bg-indigo-500 animate-progress origin-left w-full"></div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobGrid;
