import React from 'react';
import { X, Key, Globe, Cpu, Moon, Sun } from 'lucide-react';
import { AIConfig, UserStats } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  setTheme: (t: 'dark' | 'light') => void;
  aiConfig: AIConfig;
  setAiConfig: (cfg: AIConfig) => void;
  userName: string;
  setUserName: (name: string) => void;
  major: string;
  setMajor: (major: string) => void;
  stats: UserStats;
  setStats: (stats: UserStats) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  setTheme,
  aiConfig,
  setAiConfig,
  userName,
  setUserName,
  major,
  setMajor,
  stats,
  setStats
}: SettingsModalProps) {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`w-full max-w-lg p-6 rounded-2xl relative overflow-hidden transition-all ${isDark ? 'glass-card text-white' : 'glass-card-light text-slate-800'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-200/50 dark:border-white/5">
          <h3 className="text-lg font-bold tracking-tight">System Settings</h3>
          <button 
            onClick={onClose} 
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Settings */}
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Interface Theme</h4>
            <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${theme === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${theme === 'dark' ? 'bg-[#0a0810] text-indigo-400 shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
            </div>
          </div>

          {/* Personalization */}
          <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Personalization</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aariz"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 block mb-1">Major / Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 block mb-1">Target GPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder="e.g. 4.0"
                  value={stats.gpaGoal || ''}
                  onChange={(e) => setStats({ ...stats, gpaGoal: parseFloat(e.target.value) || 0 })}
                  className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                />
              </div>
            </div>
          </div>

          {/* AI Settings Section */}
          <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">AI Engine & Integration</h4>
            <p className="text-xs text-slate-500 dark:text-gray-400 mb-3 leading-relaxed">
              Acadly uses built-in models for syllabus parsing and milestones. When exporting this app, you can seamlessly connect your own direct API endpoint below.
            </p>

            <div className="space-y-3">
              {/* Provider Selection */}
              <div>
                <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 block mb-1">AI Provider</label>
                <select
                  value={aiConfig.provider}
                  onChange={(e) => setAiConfig({ 
                    ...aiConfig, 
                    provider: e.target.value as any,
                    model: e.target.value === 'custom-gemini' ? 'gemini-2.5-flash' : e.target.value === 'custom-openai' ? 'gpt-4o-mini' : ''
                  })}
                  className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                >
                  <option value="built-in">Acadly Cloud API (Express Server)</option>
                  <option value="custom-gemini">Custom Gemini API (Direct Client-Side)</option>
                  <option value="custom-openai">Custom OpenAI API (Direct Client-Side)</option>
                </select>
              </div>

              {aiConfig.provider !== 'built-in' && (
                <div className="space-y-3 animate-fade-in">
                  {/* API Key */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                      <Key className="w-3 h-3" /> API Key / Token
                    </label>
                    <input
                      type="password"
                      placeholder="Paste your secret API key..."
                      value={aiConfig.apiKey}
                      onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value })}
                      className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>

                  {/* API Endpoint */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                      <Globe className="w-3 h-3" /> API Endpoint Base URL
                    </label>
                    <input
                      type="text"
                      placeholder={aiConfig.provider === 'custom-gemini' ? 'https://generativelanguage.googleapis.com' : 'https://api.openai.com'}
                      value={aiConfig.endpoint}
                      onChange={(e) => setAiConfig({ ...aiConfig, endpoint: e.target.value })}
                      className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>

                  {/* Model ID */}
                  <div>
                    <label className="text-[11px] font-mono text-slate-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                      <Cpu className="w-3 h-3" /> Target Model Identifier
                    </label>
                    <input
                      type="text"
                      placeholder={aiConfig.provider === 'custom-gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
                      value={aiConfig.model}
                      onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                      className={`w-full text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex justify-end border-t pt-4 border-slate-200/50 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm transition-all font-semibold"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
}
