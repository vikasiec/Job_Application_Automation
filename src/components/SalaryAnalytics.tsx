import React, { useState, useMemo } from 'react';
import { Application, Job, Profile } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, DollarSign, Target, Award, Layers, Calculator, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface SalaryAnalyticsProps {
  applications: Application[];
  jobs: Job[];
  profile: Profile;
}

// Robust custom salary parser to handle "$120,000 - $150,000", "$80 - $110 / hr", "75k", etc.
function parseSalaryValue(salaryStr: string): { midpoint: number; low: number; high: number; isHourly: boolean } {
  if (!salaryStr) return { midpoint: 0, low: 0, high: 0, isHourly: false };
  const clean = salaryStr.toLowerCase();
  
  // Check if hourly
  const isHourly = clean.includes('/hr') || clean.includes('hr') || clean.includes('hour') || clean.includes('/ hr');
  
  // Extract all numbers
  const numbers = clean.replace(/,/g, '').match(/\d+/g);
  if (!numbers || numbers.length === 0) return { midpoint: 0, low: 0, high: 0, isHourly: false };
  
  const parsed = numbers.map(n => {
    let val = parseInt(n, 10);
    // If written as "120k" or similar but we parsed just "120"
    if (val < 1000 && !isHourly && (clean.includes(`${val}k`) || clean.includes(`${val} k`))) {
      val *= 1000;
    }
    return val;
  });
  
  let low = parsed[0];
  let high = parsed.length > 1 ? parsed[1] : low;

  // If small numbers like "85" but not hourly and not thousands, assume thousands
  if (low < 1000 && !isHourly) {
    low *= 1000;
    high *= 1000;
  }
  
  // If hourly, convert to annual (2000 working hours)
  if (isHourly) {
    low *= 2000;
    high *= 2000;
  }
  
  return {
    low,
    high,
    midpoint: Math.round((low + high) / 2),
    isHourly
  };
}

export default function SalaryAnalytics({ applications, jobs, profile }: SalaryAnalyticsProps) {
  const [activeChartTab, setActiveChartTab] = useState<'spectrum' | 'correlation' | 'breakdown'>('spectrum');

  // Convert Profile Target Salary to parsed number (Default to $105,000 if not filled)
  const targetSalaryValue = useMemo(() => {
    const parsed = parseSalaryValue(profile.salaryExpectation || "$105,000");
    return parsed.midpoint || 105000;
  }, [profile.salaryExpectation]);

  // Merge applicant data and scanned job vacancies to provide a richer analysis pool
  const analyticsData = useMemo(() => {
    const poolMap = new Map<string, { company: string; title: string; salaryStr: string; matchScore: number; source: 'applied' | 'scanned'; jobType: string }>();

    // 1. Add current tracked board applications
    applications.forEach(app => {
      // Find matching job details if present to fetch score and type, else fallback
      const matchingJob = jobs.find(j => j.id === app.jobId);
      poolMap.set(`${app.company}-${app.jobTitle}`, {
        company: app.company,
        title: app.jobTitle,
        salaryStr: matchingJob?.salary || "$110,000", // Fallback standard representation
        matchScore: matchingJob?.matchScore || 85,
        source: 'applied',
        jobType: matchingJob?.type || 'Full-time'
      });
    });

    // 2. Add remaining available high match explorer jobs
    jobs.forEach(job => {
      const key = `${job.company}-${job.title}`;
      if (!poolMap.has(key)) {
        poolMap.set(key, {
          company: job.company,
          title: job.title,
          salaryStr: job.salary,
          matchScore: job.matchScore,
          source: 'scanned',
          jobType: job.type
        });
      }
    });

    // Parse and synthesize final dataset
    return Array.from(poolMap.values()).map(item => {
      const { low, high, midpoint } = parseSalaryValue(item.salaryStr);
      return {
        ...item,
        low,
        high,
        salaryMidpoint: midpoint,
        salaryLabel: item.salaryStr,
        nameAbbr: item.company.length > 12 ? `${item.company.substring(0, 10)}..` : item.company,
        differenceFromTarget: midpoint - targetSalaryValue,
        matchScore: item.matchScore
      };
    }).filter(item => item.salaryMidpoint > 0);
  }, [applications, jobs, targetSalaryValue]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (analyticsData.length === 0) return { avg: 0, high: 0, low: 0, aboveTargetCount: 0 };
    
    let sum = 0;
    let high = 0;
    let low = Infinity;
    let aboveTarget = 0;

    analyticsData.forEach(item => {
      sum += item.salaryMidpoint;
      if (item.salaryMidpoint > high) high = item.salaryMidpoint;
      if (item.salaryMidpoint < low) low = item.salaryMidpoint;
      if (item.salaryMidpoint >= targetSalaryValue) aboveTarget++;
    });

    return {
      avg: Math.round(sum / analyticsData.length),
      high,
      low,
      aboveTargetCount: aboveTarget
    };
  }, [analyticsData, targetSalaryValue]);

  // Grouped average salary by Job Type
  const salaryByJobType = useMemo(() => {
    const groups: { [key: string]: { sum: number; count: number } } = {};
    analyticsData.forEach(item => {
      const type = item.jobType || 'Full-time';
      if (!groups[type]) {
        groups[type] = { sum: 0, count: 0 };
      }
      groups[type].sum += item.salaryMidpoint;
      groups[type].count += 1;
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];
    return Object.keys(groups).map((key, index) => ({
      name: key,
      averageSalary: Math.round(groups[key].sum / groups[key].count),
      value: Math.round(groups[key].sum / groups[key].count),
      count: groups[key].count,
      fill: colors[index % colors.length]
    }));
  }, [analyticsData]);

  // Score vs Salary correlation line data sorted by Match Score
  const correlationData = useMemo(() => {
    return [...analyticsData].sort((a, b) => a.matchScore - b.matchScore);
  }, [analyticsData]);

  const currencyFormatter = (value: number) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  const fullCurrencyFormatter = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  return (
    <div id="salary-analytics-dashboard" className="bg-white border border-zinc-100 rounded-xl p-5.5 shadow-xs space-y-6">
      {/* Dynamic Info Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-50 pb-4 gap-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center space-x-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
            <span>Market Value & Salary Benchmarks</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">Statistical projections analyzing active listings & custom match indicators mapped against target values.</p>
        </div>

        {/* Tab triggers */}
        <div className="flex space-x-1 bg-zinc-100 p-0.5 rounded-lg shrink-0 border border-zinc-150">
          <button
            onClick={() => setActiveChartTab('spectrum')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'spectrum' 
                ? 'bg-white text-zinc-900 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Spectrum vs Target
          </button>
          <button
            onClick={() => setActiveChartTab('correlation')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'correlation' 
                ? 'bg-white text-zinc-900 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Score Correlation
          </button>
          <button
            onClick={() => setActiveChartTab('breakdown')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeChartTab === 'breakdown' 
                ? 'bg-white text-zinc-900 shadow-xs' 
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Role Type Rates
          </button>
        </div>
      </div>

      {/* Summary insights grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center space-x-1">
            <DollarSign className="h-3 w-3 text-indigo-500" />
            <span>Average Midpoint</span>
          </span>
          <span className="text-lg font-extrabold text-zinc-900 mt-1">{fullCurrencyFormatter(stats.avg || 0)}</span>
          <span className="text-[9px] text-zinc-400 mt-0.5">Annualized salary mean</span>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center space-x-1">
            <Target className="h-3 w-3 text-emerald-500" />
            <span>Your Target expectation</span>
          </span>
          <span className="text-lg font-extrabold text-zinc-900 mt-1">{fullCurrencyFormatter(targetSalaryValue)}</span>
          <span className="text-[9px] text-zinc-400 mt-0.5">Configured in Profile Manager</span>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center space-x-1">
            <Award className="h-3 w-3 text-pink-500" />
            <span>Max Compensation</span>
          </span>
          <span className="text-lg font-extrabold text-zinc-900 mt-1">{stats.high > 0 ? fullCurrencyFormatter(stats.high) : '$0'}</span>
          <span className="text-[9px] text-zinc-400 mt-0.5">Top regional scope discovered</span>
        </div>

        <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-100 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 flex items-center space-x-1">
            <Layers className="h-3 w-3 text-amber-500" />
            <span>Target Match Rate</span>
          </span>
          <span className="text-lg font-extrabold text-zinc-900 mt-1">
            {stats.aboveTargetCount} / {analyticsData.length}
          </span>
          <span className="text-[9px] text-zinc-400 mt-0.5">Opportunities &ge; target limit</span>
        </div>
      </div>

      {/* Render Chart Area */}
      <div className="h-[280px] w-full font-mono text-[10px]">
        {analyticsData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-100 bg-zinc-50/20 rounded-xl text-center p-6 space-y-2">
            <Calculator className="h-6 w-6 text-zinc-300" />
            <h4 className="text-xs font-bold text-zinc-800">Visual Insights Pending</h4>
            <p className="text-[10px] text-zinc-400 max-w-sm">Please execute local scans or map tracking applications in "Explore Matches" to build your active salary distribution index.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'spectrum' ? (
              // CHART 1: SALARY SPECTRUM VS TARGET (BAR CHART)
              <BarChart
                data={analyticsData}
                margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="nameAbbr" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                />
                <YAxis 
                  tickFormatter={currencyFormatter} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                />
                <Tooltip 
                  cursor={{ fill: '#fafafa' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const isAbove = data.salaryMidpoint >= targetSalaryValue;
                      return (
                        <div className="bg-zinc-900 text-zinc-100 border border-zinc-800 p-3 rounded-lg shadow-md font-sans text-xs space-y-1.5">
                          <p className="font-extrabold leading-none text-white">{data.company}</p>
                          <p className="text-[11px] text-zinc-400 leading-none">{data.title}</p>
                          <p className="font-mono text-[11px] font-bold text-indigo-300 pt-1 leading-none">
                            Midpoint: {fullCurrencyFormatter(data.salaryMidpoint)}
                          </p>
                          <p className={`text-[10px] font-semibold leading-none ${isAbove ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {isAbove 
                              ? `+${fullCurrencyFormatter(data.salaryMidpoint - targetSalaryValue)} above target`
                              : `${fullCurrencyFormatter(targetSalaryValue - data.salaryMidpoint)} below target`
                            }
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine 
                  y={targetSalaryValue} 
                  stroke="#10b981" 
                  strokeWidth={1.5} 
                  strokeDasharray="4 4"
                  // label={{ value: 'Your Target expectation', position: 'top', fill: '#10b981', fontSize: 9, fontWeight: 'bold' }} 
                />
                <Bar 
                  dataKey="salaryMidpoint" 
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                >
                  {analyticsData.map((entry, index) => {
                    const isAbove = entry.salaryMidpoint >= targetSalaryValue;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isAbove ? '#6366f1' : '#a5b4fc'} 
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : activeChartTab === 'correlation' ? (
              // CHART 2: CORRELATION LINE CHART (SCORE VS SALARY)
              <LineChart
                data={correlationData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis 
                  dataKey="matchScore" 
                  name="Match Score" 
                  tickFormatter={s => `${s}%`} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                />
                <YAxis 
                  tickFormatter={currencyFormatter} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 text-zinc-100 border border-zinc-800 p-3 rounded-lg shadow-md font-sans text-xs space-y-1.5">
                          <p className="font-extrabold leading-none text-white">{data.company}</p>
                          <p className="text-[11px] text-zinc-400 leading-none">{data.title}</p>
                          <p className="font-mono text-[11px] leading-none text-indigo-300 font-bold pt-1">
                            Fit Index: {data.matchScore}%
                          </p>
                          <p className="font-mono text-[11px] leading-none text-emerald-400 font-bold">
                            Midpoint: {fullCurrencyFormatter(data.salaryMidpoint)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="salaryMidpoint" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#fff' }}
                />
              </LineChart>
            ) : (
              // CHART 3: ROLE TYPE AVERAGE RATES (PIE CHART OR RADIAL REPRESENTATION / COMPACT BAR FOR ROLES)
              <BarChart
                data={salaryByJobType}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f4f5" />
                <XAxis 
                  type="number" 
                  tickFormatter={currencyFormatter} 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#a1a1aa" 
                  width={75}
                />
                <Tooltip 
                  cursor={{ fill: '#fafafa' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-zinc-900 text-zinc-100 border border-zinc-800 p-3 rounded-lg shadow-md font-sans text-xs space-y-1">
                          <p className="font-extrabold text-white leading-none">{data.name}</p>
                          <p className="text-[11px] text-zinc-400 pt-0.5 leading-none">{data.count} listed positions</p>
                          <p className="font-mono text-[11px] text-indigo-300 font-extrabold pt-1">Average: {fullCurrencyFormatter(data.averageSalary)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="averageSalary" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {salaryByJobType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-start space-x-2 p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl">
        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-700 leading-relaxed font-sans">
          <strong>Market Trend Fact:</strong> Visual charts calculate compensation ranges on active job requirements. High fit scores correlated with market salary limits represent standard strategic entry points. Use custom resume variants to increase match vectors.
        </p>
      </div>
    </div>
  );
}
