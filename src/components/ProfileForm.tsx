import React, { useState } from 'react';
import { Profile } from '../types';
import { User, Mail, Phone, MapPin, Tag, Plus, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileFormProps {
  profile: Profile;
  onSave: (updated: Profile) => void;
}

export default function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [newSkill, setNewSkill] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (cleanSkill && !formData.skills.includes(cleanSkill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, cleanSkill],
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-100 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">Professional Identity Profile</h2>
          <p className="text-sm text-zinc-500 mt-1">This context scales directly to Gemini for relevant job matchmaking and custom resume alignment.</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-lg text-sm font-medium mt-4 md:mt-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>Profile stored locally!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Basic Information */}
        <div className="space-y-6 border border-zinc-100 bg-white p-5 rounded-xl shadow-xs">
          <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-400 flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Primary Profile Meta Data</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-name" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Candidate Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  id="p-name"
                  name="name"
                  value={formData.name}
                  onChange={handleTextChange}
                  placeholder="e.g. Vikas Kumar"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-8.5 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
                <User className="absolute left-2.5 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label htmlFor="p-title" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Primary Professional Title</label>
              <div className="relative">
                <input
                  type="text"
                  id="p-title"
                  name="currentTitle"
                  value={formData.currentTitle}
                  onChange={handleTextChange}
                  placeholder="e.g. React Developer"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-3 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-email" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Contact Email</label>
              <div className="relative">
                <input
                  type="email"
                  id="p-email"
                  name="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  placeholder="name@portal.com"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-8.5 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
                <Mail className="absolute left-2.5 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label htmlFor="p-phone" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Contact Phone</label>
              <div className="relative">
                <input
                  type="text"
                  id="p-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleTextChange}
                  placeholder="+1 (555) 019-2834"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-8.5 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                />
                <Phone className="absolute left-2.5 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="p-city" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Target City & Region</label>
              <div className="relative">
                <input
                  type="text"
                  id="p-city"
                  name="city"
                  value={formData.city}
                  onChange={handleTextChange}
                  placeholder="e.g. Chicago, IL"
                  className="w-full rounded-lg border border-zinc-200 py-2.5 pl-8.5 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
                <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-zinc-400" />
              </div>
            </div>

            <div>
              <label htmlFor="p-salary" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Salary Preference</label>
              <input
                type="text"
                id="p-salary"
                name="salaryExpectation"
                value={formData.salaryExpectation || ''}
                onChange={handleTextChange}
                placeholder="e.g. $110,000"
                className="w-full rounded-lg border border-zinc-200 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-portfolio" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Portfolio / GitHub Link</label>
            <input
              type="url"
              id="p-portfolio"
              name="portfolioUrl"
              value={formData.portfolioUrl || ''}
              onChange={handleTextChange}
              placeholder="https://github.com/myusername"
              className="w-full rounded-lg border border-zinc-200 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Tag-based Skills */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider flex items-center space-x-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Skills & Competencies</span>
            </label>
            <div className="flex border border-zinc-200 rounded-lg overflow-hidden bg-zinc-50">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Type and hit add (e.g. GraphQL)"
                className="flex-1 bg-white border-0 py-2 px-3 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="bg-zinc-800 text-white px-3.5 hover:bg-zinc-700 transition flex items-center justify-center"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-3">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center space-x-1 bg-zinc-100 text-zinc-800 text-xs font-medium px-2.5 py-1 rounded-md"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-zinc-400 hover:text-zinc-600 inline-block text-xs font-bold pl-1 border-l border-zinc-200 ml-1"
                  >
                    &times;
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-xs text-zinc-400 italic">No skills listed yet. Add some tags above.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Experience Summary & Past Resume Text */}
        <div className="space-y-6 border border-zinc-100 bg-white p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-zinc-400 flex items-center space-x-2 mb-4">
              <FileText className="h-4 w-4" />
              <span>Experience History & Background</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="p-exp" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Highlight Achievements & Employment History</label>
                <textarea
                  id="p-exp"
                  name="experience"
                  value={formData.experience}
                  onChange={handleTextChange}
                  rows={4}
                  placeholder="Describe your current and past roles, core responsibilities, and highlight achievements..."
                  className="w-full rounded-lg border border-zinc-200 py-2 px-3 text-xs focus:border-indigo-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label htmlFor="p-resume" className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wider">Paste Raw Legacy Resume Text</label>
                <textarea
                  id="p-resume"
                  name="rawResume"
                  value={formData.rawResume}
                  onChange={handleTextChange}
                  rows={8}
                  placeholder="Paste your existing text resume here for Gemini's parser to deeply optimize bullet structures..."
                  className="w-full rounded-lg border border-zinc-200 py-2 px-3 text-xs focus:border-indigo-500 focus:outline-none font-mono bg-zinc-50/50"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-zinc-900 text-white rounded-lg px-6 py-2.5 text-sm font-semibold hover:bg-zinc-800 transition shadow-sm cursor-pointer"
            >
              Commit Profile Configuration
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
