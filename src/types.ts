export interface Profile {
  name: string;
  email: string;
  phone: string;
  currentTitle: string;
  city: string;
  skills: string[];
  experience: string;
  rawResume: string;
  portfolioUrl?: string;
  salaryExpectation?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  description: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  skillsRequired: string[];
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  analysisNotes: string;
}

export interface ScreenerQuestion {
  id: string;
  question: string;
  answer: string;
}

export interface OptimizedPackage {
  optimizedSummary: string;
  enhancedBullets: string[];
  coverLetter: string;
  screenerAnswers: ScreenerQuestion[];
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  city: string;
  appliedDate: string;
  status: 'searching' | 'optimizing' | 'applying' | 'applied' | 'interviewing' | 'offered' | 'rejected';
  optimizedResume: string;
  optimizedSummary: string;
  coverLetter: string;
  screenerAnswers: ScreenerQuestion[];
  notes?: string;
}
