import React from 'react';
import { Briefcase, User, Search, MessageSquare, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAiActive: boolean;
}

export default function Navbar({ activeTab, setActiveTab, isAiActive }: NavbarProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
    { id: 'profile', label: 'Manager Profile', icon: User },
    { id: 'find', label: 'Explore Matches', icon: Search },
    { id: 'interview', label: 'AI Coach Hub', icon: MessageSquare },
  ];

  return (
    <header id="app-header" className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/10">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans text-base font-bold tracking-tight text-zinc-900">
              AutoApply <span className="text-zinc-400 font-normal">AI</span>
            </h1>
            <p className="text-[10px] font-mono text-zinc-400 leading-none mt-0.5">SMART AGENT PORTAL</p>
          </div>
        </div>

        <nav className="hidden md:flex space-x-1.5" aria-label="Primary Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isAiActive 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-zinc-50 border-zinc-200 text-zinc-600'
          }`}>
            <span className={`h-2 w-2 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></span>
            <Sparkles className="h-3 w-3 inline text-indigo-500" />
            <span>{isAiActive ? 'AI Portal Active' : 'Offline Mode'}</span>
          </div>
        </div>
      </div>

      {/* Mobile navigation tab rail */}
      <div className="md:hidden flex border-t border-zinc-100 bg-white justify-around py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-0.5 py-1 px-3 text-xs font-semibold ${
                isActive ? 'text-indigo-600' : 'text-zinc-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="scale-[0.9]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
