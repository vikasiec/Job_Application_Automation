import React, { useState } from 'react';
import { Job, Profile } from '../types';
import { Search, MapPin, IndianRupee, Briefcase, ChevronRight, CheckCircle, AlertOctagon, RefreshCw, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobListProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onSearch: (city: string, keywords: string) => void;
  loading: boolean;
  profile: Profile;
}

export default function JobList({ jobs, onSelectJob, onSearch, loading, profile }: JobListProps) {
  const [cityInput, setCityInput] = useState(profile.city || '');
  const [keywordsInput, setKeywordsInput] = useState(profile.currentTitle || '');
  const [selectedLocalJob, setSelectedLocalJob] = useState<Job | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(cityInput, keywordsInput);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Search Controller */}
      <div className="bg-white border border-zinc-100 rounded-xl p-5 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-zinc-50 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">Custom Regional Search Engine</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Let Gemini fetch or synthesize target jobs specialized for your exact background in this locale.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-3 md:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-500 transition shadow-xs flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Local Scenarios...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Scan Market Alignments</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search-title" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Target Role Title</label>
              <div className="relative">
                <input
                  type="text"
                  id="search-title"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder="e.g. Fullstack React Developer"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label htmlFor="search-loc" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Target Municipal City</label>
              <div className="relative">
                <input
                  type="text"
                  id="search-loc"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 border border-zinc-100 bg-white rounded-xl space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="h-12 w-12 rounded-full border-3 border-zinc-100 border-t-indigo-600 animate-spin"></div>
            <Search className="h-5 w-5 text-indigo-500 absolute" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-zinc-800">Prompting Gemini Recruitment Models</h4>
            <p className="text-xs text-zinc-400 mt-1">Parsing resume factors & generating hyper-realistic target postings in {cityInput}...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vacancy Sidebar feed */}
          <div className={`${selectedLocalJob ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-3.5`}>
            {jobs.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
                <Briefcase className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-zinc-800">No alignments mapped yet</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">Fill out your profile variables, then trigger "Scan Market Alignments" to generate bespoke vacancies custom-compiled by Gemini.</p>
              </div>
            ) : (
              jobs.map((job) => {
                const isSelected = selectedLocalJob?.id === job.id;
                return (
                  <motion.div
                    key={job.id}
                    id={`job-card-${job.id}`}
                    layoutId={`job-${job.id}`}
                    onClick={() => {
                      setSelectedLocalJob(job);
                      onSelectJob(job);
                    }}
                    className={`cursor-pointer border p-4.5 rounded-xl transition-all duration-200 bg-white ${
                      isSelected
                        ? 'border-indigo-500 ring-1 ring-indigo-500/10 shadow-sm'
                        : 'border-zinc-100 hover:border-zinc-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-mono font-bold uppercase py-0.5 px-2 rounded bg-zinc-100 text-zinc-600 leading-none">
                          {job.type}
                        </span>
                        <h4 className="font-sans font-bold text-zinc-900 leading-tight pr-6">{job.title}</h4>
                        <p className="font-sans font-medium text-xs text-zinc-500">{job.company}</p>
                      </div>

                      <div className={`flex items-center space-x-1 border px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${getScoreColor(job.matchScore)}`}>
                        <span>{job.matchScore}% Match</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono mt-3">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{job.location}</span>
                      </span>
                      <span className="flex items-center space-x-1 font-sans font-bold text-zinc-600">
                        <IndianRupee className="h-3 w-3 shrink-0" />
                        <span>{job.salary}</span>
                      </span>
                    </div>

                    {/* Skill matching meter snippet */}
                    <div className="mt-4 pt-3.5 border-t border-zinc-50 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-zinc-400 font-medium">
                        Match Score breakdown: {job.matchingSkills.length} matches, {job.missingSkills.length} gaps
                      </span>
                      <ChevronRight className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-zinc-400'}`} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Alignment Analyzer Detail view */}
          <AnimatePresence>
            {selectedLocalJob && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-7 bg-white border border-zinc-100 rounded-xl p-5.5 space-y-5.5 shadow-sm sticky top-20"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <span className="inline-block text-[10px] font-mono font-bold uppercase py-0.5 px-2 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                      MATCHING ATTS INSIGNIA
                    </span>
                    <h3 className="text-lg font-extrabold text-zinc-900 mt-1 leading-snug">{selectedLocalJob.title}</h3>
                    <p className="text-sm font-semibold text-zinc-500">{selectedLocalJob.company}</p>
                  </div>
                  <div className={`mt-3 sm:mt-0 flex flex-col items-center border p-3 rounded-xl text-center shrink-0 w-24 ${getScoreColor(selectedLocalJob.matchScore)}`}>
                    <span className="text-xs font-semibold leading-none">FIT SCORE</span>
                    <span className="text-xl font-black mt-1 leading-none">{selectedLocalJob.matchScore}%</span>
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase font-semibold">Compensation Range</span>
                    <span className="text-xs font-bold text-zinc-800 flex items-center mt-1">
                      <IndianRupee className="h-3 w-3 text-emerald-600 mr-0.5 shrink-0" />
                      {selectedLocalJob.salary}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase font-semibold">Deployment Type</span>
                    <span className="text-xs font-bold text-zinc-800 flex items-center mt-1">
                      <Briefcase className="h-3 w-3 text-indigo-500 mr-1 shrink-0" />
                      {selectedLocalJob.type}
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-lg col-span-2 md:col-span-1">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase font-semibold">Locale Target</span>
                    <span className="text-xs font-bold text-zinc-800 flex items-center mt-1">
                      <MapPin className="h-3 w-3 text-rose-500 mr-1 shrink-0" />
                      <span className="truncate">{selectedLocalJob.location}</span>
                    </span>
                  </div>
                </div>

                {/* Match Analysis Notes from Gemini */}
                <div className="bg-zinc-50/50 border border-zinc-100 rounded-xl p-4.5 space-y-2">
                  <h4 className="text-xs font-extrabold text-zinc-900 tracking-wider uppercase">AI Recruiter Alignment Review</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-sans">{selectedLocalJob.analysisNotes}</p>
                </div>

                {/* Skills Matchmaker panel */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-emerald-100 rounded-xl p-3.5 space-y-2 bg-emerald-50/15">
                    <h5 className="text-[11px] font-bold text-emerald-800 uppercase flex items-center space-x-1.5 tracking-wide">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Skill Intersect ({selectedLocalJob.matchingSkills.length})</span>
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocalJob.matchingSkills.map(sk => (
                        <span key={sk} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded font-mono font-medium">{sk}</span>
                      ))}
                      {selectedLocalJob.matchingSkills.length === 0 && <span className="text-xs text-zinc-400 italic">No exact intersects identified.</span>}
                    </div>
                  </div>

                  <div className="border border-rose-100 rounded-xl p-3.5 space-y-2 bg-rose-50/15">
                    <h5 className="text-[11px] font-bold text-rose-800 uppercase flex items-center space-x-1.5 tracking-wide">
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-500" />
                      <span>Skill Discrepancies ({selectedLocalJob.missingSkills.length})</span>
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedLocalJob.missingSkills.map(sk => (
                        <span key={sk} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-1.5 py-0.5 rounded font-mono font-medium">{sk}</span>
                      ))}
                      {selectedLocalJob.missingSkills.length === 0 && <span className="text-xs text-zinc-400 italic">No core discrepancies. Outstanding score!</span>}
                    </div>
                  </div>
                </div>

                {/* Job description section */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold text-zinc-900 tracking-wider uppercase">Full Vacancy Specifications</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed max-h-40 overflow-y-auto pr-2 scrollbar-thin">{selectedLocalJob.description}</p>
                </div>

                {/* Primary Action Button */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Requires resume refactoring first</span>
                  <button
                    onClick={() => onSelectJob(selectedLocalJob)}
                    className="bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-xs font-extrabold hover:bg-indigo-500 transition shadow-sm flex items-center space-x-2 cursor-pointer"
                  >
                    <FileCheck className="h-4 w-4" />
                    <span>Optimize & Deploy AutoApply</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
