import React, { useState, useEffect } from 'react';
import { Job, Profile, OptimizedPackage, ScreenerQuestion, Application } from '../types';
import { Sparkles, ArrowRight, ArrowLeft, RefreshCw, FileText, Check, ChevronRight, Terminal, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApplyWizardProps {
  job: Job;
  profile: Profile;
  onApplySuccess: (app: Application) => void;
  onCancel: () => void;
}

export default function ApplyWizard({ job, profile, onApplySuccess, onCancel }: ApplyWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States to hold the raw optimized outputs from Gemini which the user can tweak
  const [optimizedPkg, setOptimizedPkg] = useState<OptimizedPackage | null>(null);
  const [summary, setSummary] = useState('');
  const [bullets, setBullets] = useState<string[]>([]);
  const [coverLetter, setCoverLetter] = useState('');
  const [screenerAnswers, setScreenerAnswers] = useState<ScreenerQuestion[]>([]);

  // Simulation states
  const [simulateActive, setSimulateActive] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptimization = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/optimize-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, job }),
        });

        if (!res.ok) {
          throw new Error('Could not optimize application package. Please verify connections.');
        }

        const data: OptimizedPackage = await res.json();
        setOptimizedPkg(data);
        setSummary(data.optimizedSummary);
        setBullets(data.enhancedBullets || []);
        setCoverLetter(data.coverLetter);
        setScreenerAnswers(data.screenerAnswers || []);
      } catch (err: any) {
        setError(err.message || 'Unknown network deviation occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOptimization();
  }, [job, profile]);

  // Headless bot logs simulation sequence
  const startSimulation = () => {
    setSimulateActive(true);
    setSimLogs([]);
    setSimStep(0);

    const logMessages = [
      `[0.1s] INITIALIZING: Booting virtual headless chrome browser environment on sandbox worker...`,
      `[1.3s] NAVIGATING: Accessing target candidate portal gateway for "${job.company}" on localized region...`,
      `[2.5s] PARSING: Mapping ATS input form indices. Standard login parameters bypassed.`,
      `[3.7s] AUTO-FILL: Injecting core profile (Candidate: ${profile.name}, Email: ${profile.email}, Phone: ${profile.phone}).`,
      `[4.9s] COVER-LETTER: Compiling tailored motivation letter tailored specifically for "${job.title}".`,
      `[6.1s] AUTOMATION: Formulating customized screener answers based on Gemini recommendation models.`,
      `[7.3s] INTEGRATION: Uploading fully compiled PDF attachment structured with optimized experience bullets.`,
      `[8.5s] SOLVING: Securing cloud token parameters & bypassing standard platform Recaptcha limits.`,
      `[9.7s] DEPLOYING: Transmitting fully packaged payload index directly into ATS webhook API.`,
      `[11.0s] SUCCESS: Application successfully verified with return status code HTTP 201 (Created). Receipt ID: APP-${Math.floor(100000 + Math.random() * 900000)}.`
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < logMessages.length) {
        setSimLogs(prev => [...prev, logMessages[messageIndex]]);
        setSimStep(messageIndex + 1);
        messageIndex++;
      } else {
        clearInterval(interval);
      }
    }, 1300);
  };

  const finalizeApplication = () => {
    const finalApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      city: job.location,
      appliedDate: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'applied',
      optimizedResume: bullets.join('\n'),
      optimizedSummary: summary,
      coverLetter: coverLetter,
      screenerAnswers: screenerAnswers,
      notes: "Auto-filed successfully by Agent Bot."
    };
    onApplySuccess(finalApp);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white border border-zinc-100 rounded-2xl p-8 space-y-5 text-center">
        <Sparkles className="h-8 w-8 text-indigo-500 animate-pulse" />
        <div>
          <h3 className="text-base font-extrabold text-zinc-900">Custom Engineering in Progress</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            Gemini is currently refacturing your raw resume assets to match keywords for <strong>{job.title}</strong> at <strong>{job.company}</strong>...
          </p>
        </div>
        <div className="w-48 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-indigo-600 h-full rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-rose-100 rounded-2xl p-8 space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-500" />
        <div>
          <h3 className="text-base font-bold text-zinc-900">Optimization Pipeline Interrupted</h3>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          Return to Job Board
        </button>
      </div>
    );
  }

  const stepsMeta = [
    { num: 1, label: 'Resume Profile' },
    { num: 2, label: 'Bullets refinement' },
    { num: 3, label: 'Cover Letter' },
    { num: 4, label: 'Screener Q&A' },
    { num: 5, label: 'AutoApply Launch' }
  ];

  return (
    <div id="apply-wizard-wrapper" className="bg-white border border-zinc-100 rounded-2xl shadow-xs overflow-hidden">
      {/* Wizard Header bar */}
      <div className="px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Smart Apply Alignment Panel</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Customizing package for {job.title} at {job.company}</p>
        </div>
        
        {/* Step indicator pills */}
        <div className="flex items-center space-x-1">
          {stepsMeta.map(step => (
            <div
              key={step.num}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentStep === step.num
                  ? 'bg-zinc-900 text-white font-bold scale-[1.03]'
                  : currentStep > step.num
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-100 border'
                  : 'text-zinc-400'
              }`}
            >
              <span>{step.num}</span>
              <span className="hidden sm:inline text-[10px]">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* STEP 1: SUMMARY OPTIMIZATION */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-100 pb-3">
                <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-widest text-indigo-600">Tailored Resume Summary</h4>
                <p className="text-xs text-zinc-400 mt-1">This customized introduction is tailored to emphasize skills required for this role. You can review and adjust this pitch.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold">Your Legacy / Default Resume Text</span>
                  <p className="text-xs text-zinc-500 leading-relaxed max-h-48 overflow-y-auto pr-1">
                    {profile.rawResume || "No bio loaded yet. Go to profile parameters to enter a brief intro."}
                  </p>
                </div>

                <div className="p-4 border border-indigo-100 rounded-xl space-y-2.5 bg-indigo-50/5">
                  <span className="text-[10px] font-mono uppercase text-indigo-700 font-extrabold flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse" />
                    <span>Gemini Refactored Pitch</span>
                  </span>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={6}
                    className="w-full text-xs text-zinc-700 leading-relaxed font-sans bg-transparent border-0 focus:outline-none p-0 resize-none font-medium"
                    placeholder="Refactoring resume introductory text..."
                  />
                  <div className="text-[10px] text-indigo-400 italic">★ Custom keyword weight aligned for maximum ATS score.</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: BULLET REFINEMENT */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-100 pb-3">
                <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-widest text-indigo-600 font-sans">Enhanced Experience Bullet Points</h4>
                <p className="text-xs text-zinc-400 mt-1">Reconfigured highlighting phrases showcasing metrics, technology applications, and impact aligned directly for optimal alignment.</p>
              </div>

              <div className="space-y-3">
                {bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                    <span className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <textarea
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...bullets];
                          updated[idx] = e.target.value;
                          setBullets(updated);
                        }}
                        rows={2}
                        className="w-full text-xs text-zinc-700 font-sans leading-relaxed bg-transparent border-0 focus:outline-none p-0 resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: COVER LETTER */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-100 pb-3">
                <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-widest text-indigo-600">Tailored Cover Letter Draft</h4>
                <p className="text-xs text-zinc-400 mt-1">A highly professional, tailored letter expressing structural fit and candidate drive.</p>
              </div>

              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50/30">
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={10}
                  className="w-full text-xs text-zinc-700 leading-relaxed font-mono bg-transparent border-0 focus:outline-none p-0 resize-y"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: SCREENER ANSWERS */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="border-b border-zinc-100 pb-3">
                <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-widest text-indigo-600 font-sans">Smart Screener Questionnaire (Auto-Fill preview)</h4>
                <p className="text-xs text-zinc-400 mt-1">These typical screener questions are predicted for this vacancy, and answered beautifully based on your background parameters.</p>
              </div>

              <div className="space-y-4">
                {screenerAnswers.map((item, idx) => (
                  <div key={item.id} className="p-4 border border-zinc-100 bg-white rounded-xl space-y-2.5 shadow-xs">
                    <label className="block text-xs font-bold text-zinc-700 leading-snug">Q: {item.question}</label>
                    <textarea
                      value={item.answer}
                      onChange={(e) => {
                        const updated = [...screenerAnswers];
                        updated[idx].answer = e.target.value;
                        setScreenerAnswers(updated);
                      }}
                      rows={2.5}
                      className="w-full text-xs text-zinc-600 bg-zinc-50 border border-zinc-100 p-2 rounded-lg font-sans focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 5: SIMULATOR STAGE */}
          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4.5"
            >
              <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-widest text-indigo-600">Simulate Autopilot Apply Action</h4>
                  <p className="text-xs text-zinc-400 mt-1">Deploy our custom automated browser sandbox worker to index, fill, solve, and submit standard resume parameters to the destination API.</p>
                </div>
                {!simulateActive && (
                  <button
                    onClick={startSimulation}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Play className="h-3 w-3" />
                    <span>Launch Auto-Apply</span>
                  </button>
                )}
              </div>

              {/* Bot console screen */}
              <div className="border-2 border-zinc-900 bg-zinc-950 text-zinc-200 rounded-xl p-5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3.5 text-xs text-zinc-500 font-mono">
                  <span className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span>headless-agent-worker-v2.sh</span>
                  </span>
                  <span>SYSTEM STATUS: {simStep === 10 ? 'SUCCESS' : simulateActive ? 'RUNNING' : 'STANDBY'}</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-[11px] leading-relaxed pr-2">
                  {simLogs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span className={i === simLogs.length - 1 ? 'text-emerald-400 shadow-xs scale-[1.01] transition-all font-semibold' : 'text-zinc-300'}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {!simulateActive && (
                    <p className="text-zinc-600 italic text-center py-6">Console empty. Click "Launch Auto-Apply" to execute automated browser handshake simulation.</p>
                  )}
                  {simulateActive && simStep < 10 && (
                    <div className="flex items-center space-x-2 text-indigo-400 animate-pulse mt-1">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" />
                      <span>Resolving candidate portal hooks...</span>
                    </div>
                  )}
                </div>
              </div>

              {simStep === 10 && (
                <div className="flex items-center space-x-3 border border-emerald-200 bg-emerald-50 text-emerald-900 p-4 rounded-xl leading-relaxed">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 shrink-0" />
                  <div>
                    <h5 className="font-bold text-sm">Application Deployment Finished!</h5>
                    <p className="text-[11px] text-emerald-700">All optimized parameters have successfully loaded. Click Complete to record this application on your tracking board.</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wizard Footer bar controls */}
        <div className="pt-5.5 border-t border-zinc-100 flex items-center justify-between mt-5.5">
          <button
            onClick={currentStep === 1 ? onCancel : () => setCurrentStep(prev => prev - 1)}
            disabled={simulateActive && simStep < 10}
            className="flex items-center space-x-1.5 px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-bold font-sans hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{currentStep === 1 ? 'Abort' : 'Back'}</span>
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center space-x-1.5 px-5 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition cursor-pointer"
            >
              <span>Commit & Propose</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={finalizeApplication}
              disabled={simStep < 10}
              className="flex items-center space-x-1 px-6 py-2.5 bg-emerald-600 disabled:bg-zinc-200 text-white disabled:text-zinc-400 rounded-lg text-xs font-bold hover:bg-emerald-500 transition cursor-pointer shadow-sm shadow-emerald-500/10"
            >
              <Check className="h-4 w-4" />
              <span>Complete & Sync Board</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
