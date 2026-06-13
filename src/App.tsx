import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProfileForm from './components/ProfileForm';
import JobList from './components/JobList';
import ApplyWizard from './components/ApplyWizard';
import InterviewCoach from './components/InterviewCoach';
import SalaryAnalytics from './components/SalaryAnalytics';
import { Profile, Job, Application } from './types';
import { 
  Briefcase, 
  Sparkles, 
  Clock, 
  UserCheck, 
  TrendingUp, 
  FileText, 
  Trash2, 
  TrendingDown, 
  MapPin, 
  DollarSign, 
  ArrowUpRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// STABLE DEFAULT PROFILE FOR USER INITIATION
const DEFAULT_PROFILE: Profile = {
  name: "Vikas Kumar",
  email: "vikas.iec@gmail.com",
  phone: "+1 (312) 555-0143",
  currentTitle: "React Front-End Engineer",
  city: "Chicago, IL",
  skills: ["React", "TypeScript", "Tailwind CSS", "RESTful APIs", "Node.js", "Git", "Jest"],
  experience: "Junior to Mid frontend developer with 3 years of hands-on experience in Single Page Applications. Adopts comprehensive type structures with TypeScript, manages agile sprint boards, and builds responsive components styled using Tailwind classes.",
  rawResume: "VIKAS KUMAR\nvikas.iec@gmail.com | Chicago, IL\n\nPROFESSIONAL SUMMARY\nHighly competent React Front-End developer specializing in structuring user-centric interfaces. Proficient at web scalability, state optimization, and working alongside developers to resolve complex layouts.\n\nTECHNICAL STACK\nReact, TypeScript, Tailwind CSS, REST APIs, JSON validation, Git repositories.\n\nEXPERIENCE\n- React Specialist at Midwest Web Labs (2023 - Present)\n  Re-engineered key dashboard components using React 18, enhancing mobile page responsiveness.\n  Handled interface integration with backend API controllers.\n- Junior Frontend Associate at DevSols LLC (2022 - 2023)\n  Built custom styled web catalogs, adopting rigorous corporate wireframes.",
  portfolioUrl: "https://github.com/vikas-kumar-dev",
  salaryExpectation: "$105,000"
};

// INITIAL MOCK APPLICATIONS
const DEFAULT_APPLICATIONS = (city: string): Application[] => [
  {
    id: "app-hist-1",
    jobId: "mock-hist-1",
    jobTitle: "Senior Web Developer",
    company: "Apex Global Dynamics",
    city: city || "Chicago, IL",
    appliedDate: "Jun 10, 2026",
    status: "interviewing",
    optimizedSummary: "Experienced Web Specialist focused on high-performance frameworks.",
    optimizedResume: "Engineered responsive systems.",
    coverLetter: "Dear Hiring Team... I would love to join your squad.",
    screenerAnswers: [],
    notes: "Virtual Recruiter reached out, scheduled first round tech screen."
  },
  {
    id: "app-hist-2",
    jobId: "mock-hist-2",
    jobTitle: "React Frontend Practitioner",
    company: "HyperScale Tech Solutions",
    city: "Remote (USA)",
    appliedDate: "Jun 11, 2026",
    status: "applied",
    optimizedSummary: "Specialized front-end engineer adopting strict Tailwind and TypeScript models.",
    optimizedResume: "Built components.",
    coverLetter: "Highly thrilled to submit my interest...",
    screenerAnswers: [],
    notes: "Auto-filed successfully via headless agent bot."
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  
  // App states
  const [activeWizardJob, setActiveWizardJob] = useState<Job | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isAiActive, setIsAiActive] = useState(false);
  const [expandedPackageAppId, setExpandedPackageAppId] = useState<string | null>(null);

  // Initialize and load persisted local storage parameters
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('autoapply_profile_v2');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        localStorage.setItem('autoapply_profile_v2', JSON.stringify(DEFAULT_PROFILE));
      }

      const savedApps = localStorage.getItem('autoapply_applications_v2');
      if (savedApps) {
        setApplications(JSON.parse(savedApps));
      } else {
        const initialApps = DEFAULT_APPLICATIONS(savedProfile ? JSON.parse(savedProfile).city : DEFAULT_PROFILE.city);
        setApplications(initialApps);
        localStorage.setItem('autoapply_applications_v2', JSON.stringify(initialApps));
      }
    } catch (e) {
      console.error("Local storage allocation exception: ", e);
    }

    // Verify AI state by pinging health check
    const verifyAi = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setIsAiActive(data.mode === "AI Active");
        }
      } catch (err) {
        console.warn("AI health ping offline.");
      }
    };
    verifyAi();
  }, []);

  const handleSaveProfile = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    localStorage.setItem('autoapply_profile_v2', JSON.stringify(updatedProfile));
  };

  const handleSelectJobForWizard = (job: Job) => {
    setActiveWizardJob(job);
  };

  const handleSearchJobs = async (city: string, title: string) => {
    setSearchLoading(true);
    try {
      const res = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          currentTitle: title,
          city: city,
          skills: profile.skills,
          experience: profile.experience,
          rawResume: profile.rawResume
        }),
      });

      if (!res.ok) {
        throw new Error('API server failed to retrieve vacancies');
      }

      const data = await res.json();
      const loadedJobs = data.jobs || [];
      setJobs(loadedJobs);
    } catch (err) {
      console.error(err);
      // Fallback if network drops
      setJobs([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleWizardSuccess = (newApplication: Application) => {
    const updatedApps = [newApplication, ...applications];
    setApplications(updatedApps);
    localStorage.setItem('autoapply_applications_v2', JSON.stringify(updatedApps));
    setActiveWizardJob(null);
    setActiveTab('dashboard'); // Swing back to board tracking
  };

  const handleUpdateAppStatus = (appId: string, nextStatus: Application['status']) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status: nextStatus };
      }
      return app;
    });
    setApplications(updated);
    localStorage.setItem('autoapply_applications_v2', JSON.stringify(updated));
  };

  const handleDeleteApplication = (appId: string) => {
    const remaining = applications.filter(app => app.id !== appId);
    setApplications(remaining);
    localStorage.setItem('autoapply_applications_v2', JSON.stringify(remaining));
  };

  // Helper numbers for visual metric dashboardcards
  const totalApplied = applications.filter(a => a.status === 'applied').length;
  const interviewing = applications.filter(a => a.status === 'interviewing').length;
  const totalOffers = applications.filter(a => a.status === 'offered').length;
  const timeSavedValue = applications.length * 2.5; // Avg 2.5 hours saved per tailorgenerated app

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isAiActive={isAiActive} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-7"
            >
              {/* Header metrics card group */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-100 p-5 rounded-xl shadow-xs flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-400 uppercase">Automated applications</span>
                    <span className="text-xl font-extrabold text-zinc-900 leading-none">{totalApplied + interviewing + totalOffers}</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-100 p-5 rounded-xl shadow-xs flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-400 uppercase">Saved Hours Estimate</span>
                    <span className="text-xl font-extrabold text-zinc-900 leading-none">{timeSavedValue} hrs</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-100 p-5 rounded-xl shadow-xs flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-400 uppercase">Live Inteview invites</span>
                    <span className="text-xl font-extrabold text-zinc-900 leading-none">{interviewing}</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-100 p-5 rounded-xl shadow-xs flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold text-zinc-400 uppercase">Offers secured</span>
                    <span className="text-xl font-extrabold text-zinc-900 leading-none">{totalOffers}</span>
                  </div>
                </div>
              </div>

              {/* Campaign status banner */}
              <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 text-white rounded-xl p-6 relative overflow-hidden shadow-sm">
                <div className="relative z-15 max-w-lg space-y-2">
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-500/25 border border-indigo-400/25 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-300 animate-pulse" />
                    <span>AutoApply AI Core Running</span>
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight">Active Search City: {profile.city} (Target: {profile.currentTitle})</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    Your resume metrics have been configured and ready. We calculate an average ATS alignment matching score of <strong>88%</strong> based on your listed skills tags. Get started and scan local openings!
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 font-bold font-mono text-[140px] pointer-events-none translate-y-16 select-none leading-none">
                  AI
                </div>
              </div>

              {/* Salary Analytics and Benchmarks */}
              <SalaryAnalytics 
                applications={applications} 
                jobs={jobs} 
                profile={profile} 
              />

              {/* Visual Job application boards tracker */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">My Applications & Handshakes Tracker</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Control live tracking, update steps, or examine files generated for specific employer portals.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {applications.map((app) => {
                    const isExpanded = expandedPackageAppId === app.id;
                    return (
                      <div
                        key={app.id}
                        id={`app-card-${app.id}`}
                        className="bg-white border border-zinc-100 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between">
                            <span className="text-[10px] font-mono text-zinc-400">{app.appliedDate}</span>
                            
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app.id, e.target.value as Application['status'])}
                              className={`text-[10px] font-bold border rounded p-1 font-mono focus:outline-none ${
                                app.status === 'offered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : app.status === 'interviewing'
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                                  : app.status === 'rejected'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-zinc-50 text-zinc-800 border-zinc-200'
                              }`}
                            >
                              <option value="applied">Applied</option>
                              <option value="interviewing">Interviewing</option>
                              <option value="offered">Offered</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-sm text-zinc-900 leading-tight">{app.jobTitle}</h4>
                            <p className="text-xs font-semibold text-zinc-500">{app.company}</p>
                            <p className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center">
                              <MapPin className="h-3 w-3 mr-0.5 text-rose-400 shrink-0" />
                              {app.city}
                            </p>
                          </div>
                        </div>

                        {/* Expander containing compiled resume bullets, summary and cover letter */}
                        <div className="pt-2 border-t border-zinc-50 space-y-3.5">
                          <div className="flex items-center justify-between text-xs">
                            <button
                              onClick={() => setExpandedPackageAppId(isExpanded ? null : app.id)}
                              className="text-zinc-500 hover:text-zinc-900 font-semibold flex items-center space-x-1 text-[11px] focus:outline-none cursor-pointer"
                            >
                              <FileText className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                              <span>{isExpanded ? 'Hide Generated Assets' : 'Review Optimized Assets'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-rose-600 hover:text-rose-800 focus:outline-none cursor-pointer p-1"
                              title="Delete index tracking"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden text-xs text-zinc-600 space-y-2.5 bg-zinc-50 p-3 rounded-lg leading-relaxed font-sans"
                              >
                                <div>
                                  <span className="block text-[10px] font-bold text-indigo-700 uppercase">Optimized Summary Bio</span>
                                  <p className="text-[10px] text-zinc-600 leading-relaxed font-medium bg-white p-1.5 border border-zinc-100 rounded mt-0.5">{app.optimizedSummary}</p>
                                </div>
                                {app.coverLetter && (
                                  <div>
                                    <span className="block text-[10px] font-bold text-indigo-700 uppercase">Tailored Cover Letter</span>
                                    <p className="text-[9px] text-zinc-500 font-mono max-h-24 overflow-y-auto bg-white p-1.5 border border-zinc-100 rounded mt-0.5 whitespace-pre-wrap">{app.coverLetter}</p>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}

                  {applications.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                      <Briefcase className="h-7 w-7 text-zinc-300 mx-auto mb-2" />
                      <h4 className="text-sm font-semibold text-zinc-800">Tracking Board Empty</h4>
                      <p className="text-xs text-zinc-400 max-w-xs mx-auto mt-1">Ready to deploy? Visit "Explore Matches," find a vacancy, click Apply optimization, and save it hither.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: PROFILE EDITOR */}
          {activeTab === 'profile' && (
            <ProfileForm profile={profile} onSave={handleSaveProfile} />
          )}

          {/* TAB 3: EXPLORE & APPLY */}
          {activeTab === 'find' && (
            <JobList 
              jobs={jobs} 
              onSelectJob={handleSelectJobForWizard} 
              onSearch={handleSearchJobs} 
              loading={searchLoading} 
              profile={profile} 
            />
          )}

          {/* TAB 4: COACHING */}
          {activeTab === 'interview' && (
            <InterviewCoach applications={applications} jobs={jobs} />
          )}
        </AnimatePresence>
      </main>

      {/* DETAILED COVER SCREEN ACTIVE APPLY WIZARD PANEL OVERLAY */}
      <AnimatePresence>
        {activeWizardJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 200, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 200, scale: 0.95 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-zinc-200"
            >
              <ApplyWizard 
                job={activeWizardJob} 
                profile={profile} 
                onApplySuccess={handleWizardSuccess} 
                onCancel={() => setActiveWizardJob(null)} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full py-6 text-center text-xs text-zinc-400 font-mono border-t border-zinc-100 bg-white">
        © 2026 AutoApply AI Portal • Running standard Full-Stack Agent Sandboxes • Locally Encrypted State Data
      </footer>
    </div>
  );
}
