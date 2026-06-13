import React, { useState } from 'react';
import { Application, Job } from '../types';
import { Send, MessageSquare, Award, Play, BookOpen, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InterviewCoachProps {
  applications: Application[];
  jobs: Job[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function InterviewCoach({ applications, jobs }: InterviewCoachProps) {
  // Try to find jobs in applications, or fall back to searched jobs
  const selectableJobs = applications.length > 0 
    ? applications.map(app => ({ id: app.jobId, title: app.jobTitle, company: app.company, location: app.city })) 
    : jobs.map(j => ({ id: j.id, title: j.title, company: j.company, location: j.location }));

  const [selectedJobId, setSelectedJobId] = useState<string>(selectableJobs[0]?.id || '');
  const [sessionActive, setSessionActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const activeJob = selectableJobs.find(j => j.id === selectedJobId) || selectableJobs[0];

  const startSession = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setSessionActive(true);
    setChatHistory([]);
    setFeedback('');
    setErrorCode(null);

    const firstQuestionPrompt = `Hi! I'm your AI recruiter mentor. Let's practice for your upcoming interview as a ${activeJob.title} at ${activeJob.company}. Can you give me a brief overview of your background, and why you feel you are the optimal candidate for our engineering squad?`;

    setCurrentQuestion(firstQuestionPrompt);
    setLoading(false);
  };

  const handleSendAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnswer = currentInput.trim();
    if (!cleanAnswer || loading) return;

    setLoading(true);
    setErrorCode(null);

    // Save user answer in history
    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', text: cleanAnswer }
    ];
    setChatHistory(updatedHistory);
    setCurrentInput('');

    try {
      const res = await fetch('/api/interview-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedHistory,
          currentMessage: cleanAnswer,
          jobDetails: activeJob,
          candidateName: 'Candidate'
        }),
      });

      if (!res.ok) {
        throw new Error('API server failed to score interview response.');
      }

      const data = await res.json();
      setFeedback(data.feedback);
      setCurrentQuestion(data.nextQuestion);
      
      // Save assistant answer in history
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', text: data.nextQuestion }
      ]);
    } catch (err: any) {
      setErrorCode(err.message || 'Interviewer service fell offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-100 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-zinc-900">AI Recruiter & Interview Coach</h2>
        <p className="text-sm text-zinc-500 mt-1">Practice mock interviews structured precisely for positions you configured on your board. Get real-time score feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Job selector sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-zinc-100 rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold tracking-wider text-zinc-400 uppercase flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Configure Target Prep</span>
            </h3>

            {selectableJobs.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No active alignments identified. Search jobs or apply to a role first to begin coaching.</p>
            ) : (
              <div className="space-y-2.5">
                <label htmlFor="coach-target-job" className="block text-xs font-bold text-zinc-600 mb-1">Target Applied Position</label>
                <select
                  id="coach-target-job"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  disabled={sessionActive}
                  className="w-full text-xs font-medium rounded-lg border border-zinc-200 p-2.5 bg-zinc-50 focus:outline-none focus:border-zinc-300"
                >
                  {selectableJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.company})
                    </option>
                  ))}
                </select>

                <div className="pt-3">
                  {!sessionActive ? (
                    <button
                      onClick={startSession}
                      className="w-full py-2.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Play className="h-4 w-4 text-emerald-400" />
                      <span>Launch Interview Cycle</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSessionActive(false)}
                      className="w-full py-2.5 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Reset Mock Interview</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-50 border border-zinc-100 rounded-xl p-5 space-y-3 shadow-xs"
            >
              <h4 className="text-xs font-extrabold text-indigo-700 uppercase flex items-center space-x-1.5">
                <Award className="h-4 w-4 text-indigo-600" />
                <span>AI Mentor Critique</span>
              </h4>
              <p className="text-xs text-zinc-700 leading-relaxed italic">"{feedback}"</p>
            </motion.div>
          )}
        </div>

        {/* Dynamic chat area */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!sessionActive ? (
              <motion.div
                key="inactive"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-200 bg-zinc-50/20 rounded-2xl p-8 text-center space-y-3.5"
              >
                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 ring-4 ring-indigo-50/50">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-zinc-900">Virtual Mentor Session Offline</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-sm">Configure your target resume and title parameters, then click "Launch Interview Cycle" to begin practicing dynamic, AI-structured mock question-and-answer panels.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-zinc-100 rounded-2xl flex flex-col h-[540px] overflow-hidden shadow-xs"
              >
                {/* Active interview metadata banner */}
                <div className="bg-zinc-50 border-b border-zinc-100 px-5 py-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase bg-indigo-150 text-indigo-800 font-extrabold py-0.5 px-2 rounded-sm border border-indigo-200">
                      LIVE INTERVIEW SIMULATION
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900">{activeJob?.title} Prep</h4>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono italic">Roleplay active</span>
                </div>

                {/* Dialog feed thread */}
                <div id="interview-chat-feed" className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Assistant first question */}
                  <div className="flex items-start space-x-3 max-w-[85%]">
                    <div className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 text-white flex items-center justify-center text-xs font-black shrink-0">
                      AI
                    </div>
                    <div className="bg-zinc-100/80 p-3.5 rounded-2xl rounded-tl-none text-xs text-zinc-700 leading-relaxed font-sans">
                      Let's practice for your upcoming interview as a <strong>{activeJob.title}</strong> at <strong>{activeJob.company}</strong>. Can you give me a brief overview of your background, and why you feel you are the optimal candidate for our agile squad?
                    </div>
                  </div>

                  {chatHistory.map((msg, i) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={i}
                        className={`flex items-start space-x-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse space-x-reverse' : ''}`}
                      >
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold leading-none shrink-0 ${
                          isUser ? 'bg-indigo-600 border border-indigo-700 text-white' : 'bg-zinc-900 text-white'
                        }`}>
                          {isUser ? 'ME' : 'AI'}
                        </div>
                        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isUser 
                            ? 'bg-indigo-600 rounded-tr-none text-white font-medium' 
                            : 'bg-zinc-100/80 rounded-tl-none text-zinc-700'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center space-x-2 text-zinc-400 font-mono text-[10px] mt-1 pl-10 animate-pulse">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>AI Recruiter parsing response factors...</span>
                    </div>
                  )}

                  {errorCode && (
                    <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-lg text-xs leading-none">
                      <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                      <span>{errorCode}</span>
                    </div>
                  )}
                </div>

                {/* Answer Input footer bar */}
                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                  <form onSubmit={handleSendAnswer} className="flex space-x-3.5">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder={loading ? 'Interviewer is scoring answer...' : 'Type your detailed verbal pitch response here...'}
                      disabled={loading}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs focus:border-indigo-500 focus:outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading || !currentInput.trim()}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-100 text-white disabled:text-zinc-400 h-11 w-11 rounded-xl flex items-center justify-center transition shadow-xs cursor-pointer focus:outline-none"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
