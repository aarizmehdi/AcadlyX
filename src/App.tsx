import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Calendar, 
  Plus, 
  BookOpen, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Timer, 
  ChevronDown, 
  Brain, 
  Trash2, 
  FileText, 
  X, 
  Check, 
  TrendingUp, 
  ArrowRight,
  RotateCcw,
  Volume2,
  Sun,
  Moon,
  Settings,
  LogOut
} from 'lucide-react';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

import { Course, Assignment, BrokenDownStep, ChatMessage, StudySession, UserStats, AIConfig } from './types';
import { defaultCourses, defaultAssignments, defaultStats } from './data';
import AcadlyLogo from './components/AcadlyLogo';
import SettingsModal from './components/SettingsModal';

export default function App({ user }: { user: any }) {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // App states with LocalStorage persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('acadly_courses');
    return saved ? JSON.parse(saved) : defaultCourses;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('acadly_assignments');
    return saved ? JSON.parse(saved) : defaultAssignments;
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('acadly_stats');
    return saved ? JSON.parse(saved) : defaultStats;
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('acadly_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('acadly_theme') as 'dark' | 'light') || 'dark';
  });

  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('acadly_user_name') || 'Aariz';
  });

  const [major, setMajor] = useState<string>(() => {
    return localStorage.getItem('acadly_major') || 'Computer Science';
  });

  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('acadly_ai_config');
    return saved ? JSON.parse(saved) : {
      provider: 'built-in',
      apiKey: '',
      endpoint: '',
      model: ''
    };
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'tutor' | 'parser' | 'timer'>('dashboard');
  const [expandedAssignment, setExpandedAssignment] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Form states
  const [newCourse, setNewCourse] = useState({ name: '', code: '', color: '#6366f1', credits: 3 });
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '', courseId: '', difficulty: 'medium' as const });
  const [showAddAssignment, setShowAddAssignment] = useState(false);

  // Study Timer states
  const [selectedCourseTimer, setSelectedCourseTimer] = useState<string>('');
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [pomodoroCount, setPomodoroCount] = useState(0);

  // Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('acadly_chats');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: 'Greetings! I am your AI **Study Assistant**. I am fully synchronized with your planner and assignments. Ask me to break down an upcoming topic, write study schedules, or summarize lecture notes!',
        timestamp: new Date().toISOString()
      }
    ];
  });
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Syllabus Parser states
  const [syllabusInput, setSyllabusInput] = useState('');
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<{ courses: any[]; assignments: any[] } | null>(null);

  // Initial Data Load from Firestore
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.courses) setCourses(data.courses);
          if (data.assignments) setAssignments(data.assignments);
          if (data.stats) setStats(data.stats);
          if (data.studySessions) setStudySessions(data.studySessions);
          if (data.userName) setUserName(data.userName);
          if (data.major) setMajor(data.major);
          if (data.chatMessages) setChatMessages(data.chatMessages);
          if (data.aiConfig) setAiConfig(data.aiConfig);
        } else {
          // New User
          if (user.displayName) setUserName(user.displayName);
          setShowOnboarding(true);
        }
      } catch (e) {
        console.error("Failed to load user data", e);
      } finally {
        setDataLoaded(true);
      }
    };
    loadData();
  }, [user]);

  // Sync Data to Firestore and LocalStorage
  const syncToFirestore = async (key: string, value: any) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (user && dataLoaded) {
      const fieldMap: any = {
        'acadly_courses': 'courses',
        'acadly_assignments': 'assignments',
        'acadly_stats': 'stats',
        'acadly_sessions': 'studySessions',
        'acadly_user_name': 'userName',
        'acadly_major': 'major',
        'acadly_chats': 'chatMessages',
        'acadly_ai_config': 'aiConfig'
      };
      try {
        await setDoc(doc(db, 'users', user.uid), { [fieldMap[key]]: value }, { merge: true });
      } catch (e) {
        console.error("Failed to sync", key, e);
      }
    }
  };

  useEffect(() => { syncToFirestore('acadly_courses', courses); }, [courses, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_assignments', assignments); }, [assignments, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_stats', stats); }, [stats, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_sessions', studySessions); }, [studySessions, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_user_name', userName); }, [userName, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_major', major); }, [major, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_chats', chatMessages); }, [chatMessages, dataLoaded]);
  useEffect(() => { syncToFirestore('acadly_ai_config', aiConfig); }, [aiConfig, dataLoaded]);

  useEffect(() => {
    localStorage.setItem('acadly_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('acadly_ai_config', JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Handle Study Timer countdown timer loop
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        if (timerSeconds > 0) {
          setTimerSeconds(prev => prev - 1);
        } else if (timerSeconds === 0) {
          if (timerMinutes > 0) {
            setTimerMinutes(prev => prev - 1);
            setTimerSeconds(59);
          } else {
            // Timer finished
            playCompletionBeep();
            if (timerMode === 'work') {
              // Log study session
              const finalCourse = selectedCourseTimer || (courses.length > 0 ? courses[0].id : 'general');
              const newSession: StudySession = {
                id: `session-${Date.now()}`,
                courseId: finalCourse,
                durationMinutes: 25,
                timestamp: new Date().toISOString(),
                notes: 'Productive Study Session'
              };
              setStudySessions(prev => [newSession, ...prev]);
              setStats(prev => ({
                ...prev,
                totalHoursStudied: Number((prev.totalHoursStudied + 25 / 60).toFixed(1)),
              }));
              
              setTimerMode('break');
              setTimerMinutes(5);
              setPomodoroCount(c => c + 1);
            } else {
              setTimerMode('work');
              setTimerMinutes(25);
            }
            setTimerActive(false);
          }
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerMinutes, timerSeconds, timerMode, selectedCourseTimer, courses]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Audio beep simulation via Web Audio API to prevent cross-origin issues
  const playCompletionBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio Context beep failed", e);
    }
  };

  // Central Router Client-Side AI API Call proxy with direct client-side fallback
  const executeAICall = async (endpointType: 'plan-assignment' | 'chat' | 'parse-syllabus', payload: any) => {
    // We enforce OpenRouter in the frontend to make this a 100% static React app
    const apiKey = (import.meta as any).env.VITE_OPENROUTER_API_KEY || aiConfig.apiKey;
    if (!apiKey) {
      throw new Error("VITE_OPENROUTER_API_KEY is not defined in your environment variables. Please add it to your Vercel Settings.");
    }

    const model = 'google/gemini-2.5-pro';
    const baseUrl = 'https://openrouter.ai/api/v1';
    
    let systemPrompt = "";
    let userPrompt = "";
    let jsonMode = false;

    if (endpointType === 'parse-syllabus') {
      systemPrompt = "You are a precise academic parser. Extract structured courses and assignments in valid JSON. Return schema: { courses: [{name, code, color}], assignments: [{title, description, dueDate (YYYY-MM-DD), courseCode, difficulty ('easy'|'medium'|'hard')}] }";
      userPrompt = payload.text;
      jsonMode = true;
    } else if (endpointType === 'plan-assignment') {
      const today = new Date().toISOString().split('T')[0];
      systemPrompt = "You are a study tutor. Return JSON: { steps: [{title, dueDate (YYYY-MM-DD), isCompleted: false}] }";
      userPrompt = `Break down assignment "${payload.assignmentTitle}" due ${payload.dueDate}. Today is ${today}.`;
      jsonMode = true;
    } else if (endpointType === 'chat') {
      const coursesContext = payload.courses && payload.courses.length > 0 
        ? payload.courses.map((c: any) => `- ${c.name} (${c.code})`).join("\n")
        : "None.";
      const assignmentsContext = payload.assignments && payload.assignments.length > 0
        ? payload.assignments.map((a: any) => `- ${a.title}`).join("\n")
        : "None.";

      systemPrompt = `You are Study Assistant, an academic helper. Courses:\n${coursesContext}\nAssignments:\n${assignmentsContext}`;
      userPrompt = payload.messages[payload.messages.length - 1].text;
    }

    const messages = [{ role: 'system', content: systemPrompt }];
    if (endpointType === 'chat') {
      payload.messages.forEach((m: any) => {
        messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: String(m.text) });
      });
    } else {
      messages.push({ role: 'user', content: userPrompt });
    }

    const url = `${baseUrl}/chat/completions`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "AcadlyX"
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      throw new Error(errorJson.error?.message || `OpenRouter API status ${res.status}`);
    }

    const resJson = await res.json();
    const textResponse = resJson.choices?.[0]?.message?.content || "{}";

    if (endpointType === 'chat') {
      return { text: textResponse };
    } else {
      return JSON.parse(textResponse);
    }
  };

  // Calculated variables
  const upcomingAssignments = useMemo(() => {
    return [...assignments]
      .filter(a => !a.isCompleted)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignments]);

  const completedAssignments = useMemo(() => {
    return assignments.filter(a => a.isCompleted);
  }, [assignments]);

  const courseStats = useMemo(() => {
    return courses.map(course => {
      const courseAssigns = assignments.filter(a => a.courseId === course.id);
      const done = courseAssigns.filter(a => a.isCompleted).length;
      const total = courseAssigns.length;
      const progress = total > 0 ? Math.round((done / total) * 100) : 0;
      return {
        ...course,
        activeCount: total - done,
        completedCount: done,
        totalCount: total,
        progress
      };
    });
  }, [courses, assignments]);

  // Form handlers
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.code) return;
    const course: Course = {
      id: `course-${Date.now()}`,
      name: newCourse.name,
      code: newCourse.code,
      color: newCourse.color,
      credits: Number(newCourse.credits) || 3
    };
    setCourses(prev => [...prev, course]);
    setNewCourse({ name: '', code: '', color: '#6366f1', credits: 3 });
    setShowAddCourse(false);
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title || !newAssignment.courseId || !newAssignment.dueDate) return;
    const assign: Assignment = {
      id: `assign-${Date.now()}`,
      title: newAssignment.title,
      description: newAssignment.description,
      dueDate: newAssignment.dueDate,
      courseId: newAssignment.courseId,
      isCompleted: false,
      difficulty: newAssignment.difficulty,
      progress: 0,
      brokenDownSteps: []
    };
    setAssignments(prev => [assign, ...prev]);
    setNewAssignment({ title: '', description: '', dueDate: '', courseId: '', difficulty: 'medium' });
    setShowAddAssignment(false);
  };

  const handleDeleteAssignment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const handleDeleteCourse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure? This will remove related assignments from this course.")) {
      setCourses(prev => prev.filter(c => c.id !== id));
      setAssignments(prev => prev.map(a => a.courseId === id ? { ...a, courseId: '' } : a));
    }
  };

  // Toggle assignment status
  const toggleAssignmentCompleted = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = !a.isCompleted;
        setStats(s => ({
          ...s,
          assignmentsCompleted: s.assignmentsCompleted + (nextStatus ? 1 : -1)
        }));
        return { 
          ...a, 
          isCompleted: nextStatus,
          progress: nextStatus ? 100 : 0,
          brokenDownSteps: a.brokenDownSteps?.map(step => ({ ...step, isCompleted: nextStatus }))
        };
      }
      return a;
    }));
  };

  // Toggle single step of an assignment
  const toggleStepCompleted = (assignmentId: string, stepId: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === assignmentId) {
        const steps = a.brokenDownSteps?.map(s => s.id === stepId ? { ...s, isCompleted: !s.isCompleted } : s) || [];
        const completedCount = steps.filter(s => s.isCompleted).length;
        const total = steps.length;
        const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
        const isNowDone = progress === 100;
        
        if (isNowDone && !a.isCompleted) {
          setStats(s => ({ ...s, assignmentsCompleted: s.assignmentsCompleted + 1 }));
        } else if (!isNowDone && a.isCompleted) {
          setStats(s => ({ ...s, assignmentsCompleted: s.assignmentsCompleted - 1 }));
        }

        return {
          ...a,
          brokenDownSteps: steps,
          progress,
          isCompleted: isNowDone
        };
      }
      return a;
    }));
  };

  // AI Service: Plan milestones
  const handleAIBreakdown = async (assign: Assignment) => {
    setAssignments(prev => prev.map(a => a.id === assign.id ? { ...a, aiPlanning: true } : a));
    
    try {
      const course = courses.find(c => c.id === assign.courseId);
      const data = await executeAICall('plan-assignment', {
        assignmentTitle: assign.title,
        description: assign.description,
        dueDate: assign.dueDate,
        courseName: course ? `${course.name} (${course.code})` : "General"
      });

      if (data.steps && Array.isArray(data.steps)) {
        const processedSteps: BrokenDownStep[] = data.steps.map((s: any, idx: number) => ({
          id: `step-${assign.id}-${idx}-${Date.now()}`,
          title: s.title,
          dueDate: s.dueDate || assign.dueDate,
          isCompleted: false
        }));

        setAssignments(prev => prev.map(a => {
          if (a.id === assign.id) {
            return {
              ...a,
              brokenDownSteps: processedSteps,
              progress: 0,
              aiPlanning: false
            };
          }
          return a;
        }));
      }
    } catch (err: any) {
      alert(`Study Assistant could not complete the planning: ${err.message}`);
      setAssignments(prev => prev.map(a => a.id === assign.id ? { ...a, aiPlanning: false } : a));
    }
  };

  // AI Service: Call Study Assistant Chat API
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text: chatInput,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const contextHistory = chatMessages.slice(-10);
      const data = await executeAICall('chat', {
        messages: [...contextHistory, userMsg],
        courses,
        assignments
      });

      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'model',
        text: data.text || "I apologize. I am currently feeling a bit cloudy and couldn't process that response.",
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: `*System Error:* Study Assistant lost connection. Reason: ${err.message}. Please configure your API client in Settings (top right).`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // AI Service: Syllabus / Assignment Text Parser
  const handleParseSyllabus = async () => {
    if (!syllabusInput.trim() || parseLoading) return;
    setParseLoading(true);
    setParseError(null);
    setParsedPreview(null);

    try {
      const data = await executeAICall('parse-syllabus', { text: syllabusInput });
      setParsedPreview(data);
    } catch (err: any) {
      setParseError(err.message || "Failed to parse text. Please try again.");
    } finally {
      setParseLoading(false);
    }
  };

  // Merge the AI parsed courses and assignments into state
  const handleIntegrateParsedData = () => {
    if (!parsedPreview) return;

    const courseCodeMap: { [code: string]: string } = {};
    const newCoursesList = [...courses];

    parsedPreview.courses.forEach((c: any) => {
      const existing = courses.find(ex => ex.code.toLowerCase() === c.code.toLowerCase());
      if (existing) {
        courseCodeMap[c.code] = existing.id;
      } else {
        const newId = `course-${Math.random().toString(36).substring(2, 11)}`;
        const courseObj: Course = {
          id: newId,
          name: c.name,
          code: c.code,
          color: c.color || '#6366f1',
          credits: 3
        };
        newCoursesList.push(courseObj);
        courseCodeMap[c.code] = newId;
      }
    });

    const newAssignList = [...assignments];
    parsedPreview.assignments.forEach((a: any) => {
      const targetCourseId = courseCodeMap[a.courseCode] || '';
      const assignObj: Assignment = {
        id: `assign-${Math.random().toString(36).substring(2, 11)}`,
        title: a.title,
        description: a.description || '',
        dueDate: a.dueDate || new Date().toISOString().split('T')[0],
        courseId: targetCourseId,
        isCompleted: false,
        difficulty: (a.difficulty === 'easy' || a.difficulty === 'medium' || a.difficulty === 'hard') ? a.difficulty : 'medium',
        progress: 0,
        brokenDownSteps: []
      };
      newAssignList.push(assignObj);
    });

    setCourses(newCoursesList);
    setAssignments(newAssignList);
    setActiveTab('dashboard');
    setParsedPreview(null);
    setSyllabusInput('');
    alert(`Successfully integrated ${parsedPreview.courses.length} courses and ${parsedPreview.assignments.length} assignments!`);
  };

  // UI Helper: Get difficulty styling
  const getDifficultyStyles = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20';
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-250 selection:bg-indigo-500 selection:text-white ${isDark ? 'bg-[#030207] text-gray-100' : 'bg-[#f8fafc] text-slate-800'}`}>
      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border ${isDark ? 'bg-[#0a0814] border-white/10' : 'bg-white border-slate-200'}`}
            >
              <h2 className="text-2xl font-bold mb-2">Welcome to Acadly!</h2>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Let's personalize your study space.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={userName} 
                    onChange={e => setUserName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Major / Course of Study</label>
                  <input 
                    type="text" 
                    value={major} 
                    onChange={e => setMajor(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target GPA</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="10"
                    value={stats.gpaGoal || ''} 
                    onChange={e => setStats({ ...stats, gpaGoal: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
                    placeholder="e.g. 4.0"
                  />
                </div>
                <button
                  onClick={() => setShowOnboarding(false)}
                  disabled={!userName.trim() || !major.trim() || !stats.gpaGoal}
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Ambient backgrounds */}
      {isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-emerald-900/5 rounded-full blur-[140px] pointer-events-none" />
        </>
      )}

      {/* Main Header - Floating Capsule Navbar with Scroll Blur and dynamic shadow */}
      <header className={`sticky top-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-7xl rounded-3xl border transition-all duration-300 px-6 py-3.5 flex items-center justify-between ${
        scrolled 
          ? (isDark ? 'bg-[#0a0814]/85 border-indigo-500/20 shadow-[0_10px_30px_-10px_rgba(99,102,241,0.18)] backdrop-blur-xl' : 'bg-white/85 border-slate-200/80 shadow-[0_10px_30px_-10px_rgba(148,163,184,0.22)] backdrop-blur-xl') 
          : (isDark ? 'bg-transparent border-white/5 backdrop-blur-md' : 'bg-transparent border-slate-100 backdrop-blur-md')
      }`}>
        <div className="flex items-center gap-3">
          <AcadlyLogo />
        </div>

        {/* Navigation Tabs (Pill switcher with bold 3D tactile buttons) */}
        <div className={`hidden md:flex items-center gap-1.5 p-1.5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-1.5 select-none ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 dark:border-indigo-900 shadow-[0_4px_12px_rgba(99,102,241,0.3)] translate-y-[-1.5px] active:translate-y-[1px] active:border-b-0' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-y-[-1px] active:translate-y-[0.5px]' 
                  : 'text-slate-800 hover:text-slate-900 hover:bg-white/80 hover:translate-y-[-1px] active:translate-y-[0.5px]'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-1.5 select-none ${
              activeTab === 'planner' 
                ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 dark:border-indigo-900 shadow-[0_4px_12px_rgba(99,102,241,0.3)] translate-y-[-1.5px] active:translate-y-[1px] active:border-b-0' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-y-[-1px] active:translate-y-[0.5px]' 
                  : 'text-slate-800 hover:text-slate-900 hover:bg-white/80 hover:translate-y-[-1px] active:translate-y-[0.5px]'
            }`}
          >
            Planner
          </button>
          <button 
            onClick={() => setActiveTab('tutor')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-1.5 select-none ${
              activeTab === 'tutor' 
                ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 dark:border-indigo-900 shadow-[0_4px_12px_rgba(99,102,241,0.3)] translate-y-[-1.5px] active:translate-y-[1px] active:border-b-0' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-y-[-1px] active:translate-y-[0.5px]' 
                  : 'text-slate-800 hover:text-slate-900 hover:bg-white/80 hover:translate-y-[-1px] active:translate-y-[0.5px]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Study Assistant
          </button>
          <button 
            onClick={() => setActiveTab('parser')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-1.5 select-none ${
              activeTab === 'parser' 
                ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 dark:border-indigo-900 shadow-[0_4px_12px_rgba(99,102,241,0.3)] translate-y-[-1.5px] active:translate-y-[1px] active:border-b-0' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-y-[-1px] active:translate-y-[0.5px]' 
                  : 'text-slate-800 hover:text-slate-900 hover:bg-white/80 hover:translate-y-[-1px] active:translate-y-[0.5px]'
            }`}
          >
            AI Syllabus Parser
          </button>
          <button 
            onClick={() => setActiveTab('timer')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-1.5 select-none ${
              activeTab === 'timer' 
                ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 dark:border-indigo-900 shadow-[0_4px_12px_rgba(99,102,241,0.3)] translate-y-[-1.5px] active:translate-y-[1px] active:border-b-0' 
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-y-[-1px] active:translate-y-[0.5px]' 
                  : 'text-slate-800 hover:text-slate-900 hover:bg-white/80 hover:translate-y-[-1px] active:translate-y-[0.5px]'
            }`}
          >
            <Timer className="w-3.5 h-3.5" /> Study Timer
          </button>
        </div>

        {/* Settings, theme toggle and clock */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-xl transition-all border ${isDark ? 'bg-white/5 border-white/5 text-amber-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200'}`}
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 text-sm font-semibold ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
          >
            <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Settings</span>
          </button>

          <button 
            onClick={() => auth.signOut()}
            className={`p-2 rounded-xl transition-all border flex items-center gap-1.5 text-sm font-semibold ${isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20' : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'}`}
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation bar - responsive swipe segment control styled as a beautiful floating capsule */}
      <div className={`md:hidden sticky top-[84px] z-35 mx-4 my-2 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth transition-all duration-300 ${
        scrolled 
          ? (isDark ? 'bg-[#0a0814]/90 border border-indigo-500/15 shadow-lg shadow-indigo-500/5 backdrop-blur-xl' : 'bg-white/90 border border-slate-200/80 shadow-md backdrop-blur-xl') 
          : (isDark ? 'bg-[#030207]/60 border border-white/5 backdrop-blur-md' : 'bg-white/60 border border-slate-100 backdrop-blur-md')
      }`}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-center text-xs font-bold transition-all duration-150 ${
            activeTab === 'dashboard' 
              ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 shadow-[0_3px_8px_rgba(99,102,241,0.25)] translate-y-[-1px] active:translate-y-[1px] active:border-b-0 font-extrabold' 
              : 'text-slate-800 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('planner')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-center text-xs font-bold transition-all duration-150 ${
            activeTab === 'planner' 
              ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 shadow-[0_3px_8px_rgba(99,102,241,0.25)] translate-y-[-1px] active:translate-y-[1px] active:border-b-0 font-extrabold' 
              : 'text-slate-800 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Planner
        </button>
        <button 
          onClick={() => setActiveTab('tutor')}
          className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-center text-xs font-bold transition-all duration-150 ${
            activeTab === 'tutor' 
              ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 shadow-[0_3px_8px_rgba(99,102,241,0.25)] translate-y-[-1px] active:translate-y-[1px] active:border-b-0 font-extrabold' 
              : 'text-slate-800 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Study Assistant
        </button>
        <button 
          onClick={() => setActiveTab('parser')}
          className={`flex-1 min-w-[80px] py-2 px-3 rounded-xl text-center text-xs font-bold transition-all duration-150 ${
            activeTab === 'parser' 
              ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 shadow-[0_3px_8px_rgba(99,102,241,0.25)] translate-y-[-1px] active:translate-y-[1px] active:border-b-0 font-extrabold' 
              : 'text-slate-800 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Parser
        </button>
        <button 
          onClick={() => setActiveTab('timer')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-center text-xs font-bold transition-all duration-150 ${
            activeTab === 'timer' 
              ? 'bg-indigo-600 text-white border-b-[3px] border-indigo-800 shadow-[0_3px_8px_rgba(99,102,241,0.25)] translate-y-[-1px] active:translate-y-[1px] active:border-b-0 font-extrabold' 
              : 'text-slate-800 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Study Timer
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        theme={theme}
        setTheme={setTheme}
        aiConfig={aiConfig}
        setAiConfig={setAiConfig}
        userName={userName}
        setUserName={setUserName}
        major={major}
        setMajor={setMajor}
        stats={stats}
        setStats={setStats}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Tab content area */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Personalized Welcome Banner */}
              <section className={`p-6 rounded-3xl relative overflow-hidden border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r ${isDark ? 'from-indigo-950/20 via-purple-950/10 to-transparent border-indigo-500/15' : 'from-indigo-50/50 via-purple-50/30 to-transparent border-slate-200/80'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-extrabold">{userName}</span>! 🎓
                  </h1>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{major || 'Academic Scholar'} Focus</span> • Your current GPA is <span className="font-bold text-indigo-500">{stats.currentGpa}</span> (Target: {stats.gpaGoal}). Keep up the momentum!
                  </p>
                </div>
                <div className={`flex items-center gap-2 self-start md:self-auto text-xs font-mono px-3.5 py-1.5 rounded-xl border ${isDark ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-600'}`}>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Active Study Mode
                </div>
              </section>

              {/* Dynamic Overview Stats banner (Top row) - responsive layout */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl flex flex-col justify-between ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Assignments Left</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold">{upcomingAssignments.length}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>pending tasks</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full transition-all duration-500" 
                      style={{ width: `${assignments.length > 0 ? (upcomingAssignments.length / assignments.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex flex-col justify-between ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Hours Studied</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-emerald-500 dark:text-emerald-400">{stats.totalHoursStudied}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>hours logged</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-3">
                    <TrendingUp className="w-3.5 h-3.5" /> High-focus flow active
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex flex-col justify-between ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>GPA Status</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.currentGpa}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Current GPA</span>
                  </div>
                  <div className={`text-[11px] mt-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Target goal: <span className="text-purple-600 dark:text-purple-400 font-bold">{stats.gpaGoal}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl flex flex-col justify-between ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>Completed Tasks</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-pink-500 dark:text-pink-400">{stats.assignmentsCompleted}</span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>milestones done</span>
                  </div>
                  <div className="text-[11px] text-pink-600 dark:text-pink-400 flex items-center gap-1 mt-3">
                    <Check className="w-3.5 h-3.5" /> Keep up the progress!
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Bento list of Upcoming Deadlines & Calendar Timeline */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Timeline Bento Card */}
                <div className={`p-6 rounded-3xl relative overflow-hidden ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-lg font-bold tracking-tight">Active Timeline</h2>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('planner'); setShowAddAssignment(true); }}
                      className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline transition-all font-semibold"
                    >
                      <Plus className="w-4 h-4" /> Add Deadlines
                    </button>
                  </div>

                  {/* Upcoming Deadlines lists */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                    {upcomingAssignments.length === 0 ? (
                      <div className="py-12 text-center text-gray-500">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                        <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>All cleared! No upcoming deadlines.</p>
                        <p className="text-xs text-gray-500 mt-1">Try parsing a syllabus or add assignments manually.</p>
                      </div>
                    ) : (
                      upcomingAssignments.map((assign) => {
                        const course = courses.find(c => c.id === assign.courseId);
                        const isExpanded = expandedAssignment === assign.id;
                        
                        return (
                          <div 
                            key={assign.id}
                            onClick={() => setExpandedAssignment(isExpanded ? null : assign.id)}
                            className={`p-4 border rounded-2xl transition-all cursor-pointer relative overflow-hidden ${isDark ? 'bg-white/3 border-white/5 hover:border-white/10' : 'bg-white border-slate-200/80 hover:border-indigo-500/20 shadow-sm'}`}
                          >
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-1" 
                              style={{ backgroundColor: course?.color || '#a3a3a3' }}
                            />

                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); toggleAssignmentCompleted(assign.id); }}
                                  className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${isDark ? 'border-gray-600 hover:border-emerald-500' : 'border-slate-300 hover:border-emerald-500'}`}
                                >
                                  {assign.isCompleted && <Check className="w-3 h-3 text-emerald-500" />}
                                </button>
                                <div>
                                  <h3 className="text-sm font-semibold leading-tight hover:text-indigo-600 dark:hover:text-indigo-200 transition-colors">
                                    {assign.title}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-2">
                                    {course && (
                                      <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${course.color}20`, color: course.color }}>
                                        {course.code}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {assign.dueDate}
                                    </span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${getDifficultyStyles(assign.difficulty)}`}>
                                      {assign.difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {assign.progress > 0 && (
                                  <div className="text-right">
                                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 block font-semibold">{assign.progress}%</span>
                                    <span className="text-[10px] text-gray-500 block">Complete</span>
                                  </div>
                                )}
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>

                            {/* Expanded Details Panel */}
                            {isExpanded && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 space-y-4"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>
                                  {assign.description || "No description provided."}
                                </p>

                                {/* Milestone subtask list */}
                                {assign.brokenDownSteps && assign.brokenDownSteps.length > 0 ? (
                                  <div className="space-y-2">
                                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block">Milestone Steps</span>
                                    {assign.brokenDownSteps.map((step) => (
                                      <div key={step.id} className={`flex items-center justify-between p-2 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200/60'}`}>
                                        <div className="flex items-center gap-2">
                                          <button 
                                            onClick={() => toggleStepCompleted(assign.id, step.id)}
                                            className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${step.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400 hover:border-emerald-500'}`}
                                          >
                                            {step.isCompleted && <Check className="w-3.5 h-3.5 text-white" />}
                                          </button>
                                          <span className={`text-sm ${step.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : isDark ? 'text-gray-300' : 'text-slate-700'}`}>{step.title}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 font-mono">by {step.dueDate}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isDark ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-indigo-50/50 border border-indigo-100'}`}>
                                    <div>
                                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 block">No Milestone Plan Yet</span>
                                      <span className="text-xs text-slate-500 dark:text-gray-400">Let the Study Assistant break this down into realistic steps.</span>
                                    </div>
                                    <button 
                                      onClick={() => handleAIBreakdown(assign)}
                                      disabled={assign.aiPlanning}
                                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white font-semibold rounded-xl text-xs transition-all flex-shrink-0"
                                    >
                                      {assign.aiPlanning ? (
                                        <>
                                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                          Planning...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3.5 h-3.5" />
                                          AI Plan Steps
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}

                                <div className="flex justify-end pt-1">
                                  <button 
                                    onClick={(e) => handleDeleteAssignment(assign.id, e)}
                                    className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete Deadline
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Study Assistant Quick Advice Bento Card */}
                <div className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDark ? 'bg-gradient-to-br from-indigo-950/20 to-neutral-950 border-indigo-500/10' : 'bg-indigo-50/30 border-indigo-100 shadow-sm'}`}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-500">
                      <Brain className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-md font-bold tracking-tight">Need a customized study plan?</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 max-w-lg">
                        Talk to your Study Assistant! It can draft review guides, explain core course mechanics, or query advice matching your current tasks.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('tutor')}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10"
                  >
                    Open Assistant Chat <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Active Courses & Progress tracker */}
              <div className="flex flex-col gap-6">
                
                {/* Courses Card */}
                <div className={`p-6 rounded-3xl flex flex-col gap-4 ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-500" />
                      <h2 className="text-md font-bold tracking-tight">Active Courses</h2>
                    </div>
                    <button 
                      onClick={() => setShowAddCourse(!showAddCourse)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add Course Form toggle */}
                  <AnimatePresence>
                    {showAddCourse && (
                      <motion.form 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAddCourse}
                        className="p-4 bg-slate-50 dark:bg-white/3 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3"
                      >
                        <div>
                          <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Course Code</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. CS302"
                            value={newCourse.code}
                            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Course Name</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Operating Systems"
                            value={newCourse.name}
                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                            className={`w-full border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Credits</label>
                            <input 
                              type="number" 
                              required
                              min="1" max="6"
                              value={newCourse.credits}
                              onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                              className={`w-full border rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Color Picker</label>
                            <input 
                              type="color" 
                              value={newCourse.color}
                              onChange={(e) => setNewCourse({ ...newCourse, color: e.target.value })}
                              className={`w-full h-[36px] border rounded-xl p-1 cursor-pointer focus:outline-none ${isDark ? 'bg-neutral-950 border-white/10' : 'bg-white border-slate-300'}`}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button 
                            type="button" 
                            onClick={() => setShowAddCourse(false)}
                            className={`px-3 py-1.5 rounded-xl text-sm ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-slate-200 text-slate-700'}`}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm"
                          >
                            Save Course
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Course card lists */}
                  <div className="space-y-3">
                    {courseStats.map((course) => (
                      <div key={course.id} className={`p-4 border rounded-2xl relative overflow-hidden group ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                        <div 
                          className="absolute left-0 top-0 bottom-0 w-1" 
                          style={{ backgroundColor: course.color }}
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-mono font-bold block" style={{ color: course.color }}>{course.code}</span>
                            <span className="text-sm font-semibold block mt-0.5">{course.name}</span>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteCourse(course.id, e)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-500 transition-opacity"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Progress stats bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                            <span>Progress: {course.progress}%</span>
                            <span>{course.activeCount} active tasks</span>
                          </div>
                          <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <div 
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${course.progress}%`, backgroundColor: course.color }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Timer quick view card */}
                <div className={`p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-rose-500" />
                      <h3 className="text-md font-bold tracking-tight">Quick Study Timer</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('timer')}
                      className="text-rose-500 hover:text-rose-600 font-mono text-sm font-semibold"
                    >
                      Open Timer
                    </button>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
                    Dedicate 25 uninterrupted minutes to complete your upcoming coursework blocks.
                  </p>
                  <div className={`flex items-center justify-between p-3 border rounded-2xl ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="font-mono">
                      <span className="text-lg font-bold">25:00</span>
                      <span className="text-[10px] text-gray-500 ml-2">Standard block</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab('timer')}
                      className="px-4 py-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20 rounded-xl text-xs transition-all font-semibold"
                    >
                      Start Flow
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Planner view */}
          {activeTab === 'planner' && (
            <motion.div 
              key="planner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">My Study Planner</h2>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Add, view, and organize all your coursework and homework due dates in one simple list.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddAssignment(!showAddAssignment)}
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 self-start"
                  >
                    <Plus className="w-4 h-4" /> Add Assignment
                  </button>
                </div>

                {/* Add Assignment form */}
                <AnimatePresence>
                  {showAddAssignment && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      onSubmit={handleAddAssignment}
                      className={`p-6 border rounded-3xl space-y-4 mb-6 ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'}`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Assignment Title</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Memory Page Table Design"
                            value={newAssignment.title}
                            onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Course Code</label>
                          <select 
                            required
                            value={newAssignment.courseId}
                            onChange={(e) => setNewAssignment({ ...newAssignment, courseId: e.target.value })}
                            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          >
                            <option value="">Select an active course...</option>
                            {courses.map(c => (
                              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Due Date</label>
                          <input 
                            type="date" 
                            required
                            value={newAssignment.dueDate}
                            onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 font-mono ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Complexity / Difficulty</label>
                          <select 
                            value={newAssignment.difficulty}
                            onChange={(e) => setNewAssignment({ ...newAssignment, difficulty: e.target.value as any })}
                            className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                          >
                            <option value="easy">Easy (Under 2 hours)</option>
                            <option value="medium">Medium (Under 6 hours)</option>
                            <option value="hard">Hard (Multi-day project)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Details & Description</label>
                        <textarea 
                          rows={3}
                          placeholder="What needs to be submitted? Mention specific rubrics, page requirements..."
                          value={newAssignment.description}
                          onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                          className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button 
                          type="button" 
                          onClick={() => setShowAddAssignment(false)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-slate-200 text-slate-700'}`}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm"
                        >
                          Create Deadline
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* List tabs */}
                <div className="space-y-4">
                  <h3 className="text-md font-bold mb-2">Upcoming Assignments ({upcomingAssignments.length})</h3>
                  
                  {upcomingAssignments.length === 0 ? (
                    <div className={`py-12 text-center border rounded-2xl ${isDark ? 'bg-white/1 border-white/5 text-gray-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                      <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-2" />
                      <p className="text-sm font-semibold">No pending tasks!</p>
                      <p className="text-xs">Perfect scorecard. Try adding a new task to track.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {upcomingAssignments.map((assign) => {
                        const course = courses.find(c => c.id === assign.courseId);
                        return (
                          <div key={assign.id} className={`p-5 border rounded-2xl flex flex-col justify-between gap-4 ${isDark ? 'bg-white/2 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold" style={{ color: course?.color || '#3b82f6', backgroundColor: `${course?.color || '#3b82f6'}15` }}>
                                  {course ? course.code : "General"}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded capitalize ${getDifficultyStyles(assign.difficulty)}`}>
                                  {assign.difficulty}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold mt-2 leading-tight">{assign.title}</h4>
                              <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{assign.description || "No description provided."}</p>
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-mono">Due: {assign.dueDate}</span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleAIBreakdown(assign)}
                                  disabled={assign.aiPlanning}
                                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                >
                                  {assign.aiPlanning ? "Planning..." : "AI Plan Steps"}
                                </button>
                                <button 
                                  onClick={() => toggleAssignmentCompleted(assign.id)}
                                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                  Mark Done
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <h3 className="text-md font-bold pt-6 mb-2">Completed Tasks ({completedAssignments.length})</h3>
                  
                  {completedAssignments.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No completed tasks yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {completedAssignments.map((assign) => {
                        const course = courses.find(c => c.id === assign.courseId);
                        return (
                          <div key={assign.id} className={`p-3 border rounded-xl flex items-center justify-between opacity-75 ${isDark ? 'bg-white/2 border-white/3' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              <div>
                                <span className="text-sm font-semibold line-through">{assign.title}</span>
                                <span className="text-xs text-gray-400 font-mono ml-2">[{course ? course.code : "General"}]</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => toggleAssignmentCompleted(assign.id)}
                              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              Undo Complete
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Syllabus Parser Tab */}
          {activeTab === 'parser' && (
            <motion.div 
              key="parser"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-3xl relative overflow-hidden ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-indigo-500" />
                  <h2 className="text-xl font-bold tracking-tight">AI Syllabus & Homework Parser</h2>
                </div>
                <p className={`text-sm max-w-2xl ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Simply paste raw syllabus copy, schedule details, or list of assignments directly from your school portal. 
                  The Study Assistant will auto-extract courses, colors, and calculate due dates into your planner state instantly.
                </p>

                <div className="mt-6 space-y-4">
                  <textarea 
                    rows={8}
                    value={syllabusInput}
                    onChange={(e) => setSyllabusInput(e.target.value)}
                    placeholder="Paste syllabus text here. For example:
- MATH240 Linear Algebra: Homework 1 on Vector Spaces is due on July 10.
- CS302 Operating Systems Quiz 1 will take place on July 15.
- HCI CS355 draft prototype due July 22."
                    className={`w-full border rounded-2xl p-4 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed placeholder:text-gray-500 ${isDark ? 'bg-neutral-900/80 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-850'}`}
                  />

                  {parseError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button 
                      onClick={handleParseSyllabus}
                      disabled={parseLoading || !syllabusInput.trim()}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10"
                    >
                      {parseLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Analyzing and Parsing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Parse Text with AI
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Extracted Preview Table */}
                {parsedPreview && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-8 p-6 border rounded-3xl space-y-6 ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div>
                      <h3 className="text-md font-bold tracking-tight">Parser Extraction Results</h3>
                      <p className="text-xs text-gray-500">Review the extracted curriculum before integrating into your calendar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Courses Preview */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-wider">Extracted Courses ({parsedPreview.courses?.length || 0})</h4>
                        <div className="space-y-2">
                          {parsedPreview.courses && parsedPreview.courses.length > 0 ? (
                            parsedPreview.courses.map((c: any, idx: number) => (
                              <div key={idx} className={`flex items-center justify-between p-3 border rounded-xl ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                  <span className="text-sm font-bold">{c.code}</span>
                                </div>
                                <span className="text-xs text-gray-500">{c.name}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No new courses detected.</p>
                          )}
                        </div>
                      </div>

                      {/* Assignments Preview */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider">Extracted Deadlines ({parsedPreview.assignments?.length || 0})</h4>
                        <div className="space-y-2">
                          {parsedPreview.assignments && parsedPreview.assignments.length > 0 ? (
                            parsedPreview.assignments.map((a: any, idx: number) => (
                              <div key={idx} className={`p-3 border rounded-xl space-y-1 ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold">{a.title}</span>
                                  <span className="text-xs font-mono text-indigo-500">{a.courseCode}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                                  <span>Due: {a.dueDate}</span>
                                  <span className="capitalize">{a.difficulty}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No assignments detected.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200 dark:border-white/5 flex justify-end gap-2">
                      <button 
                        onClick={() => setParsedPreview(null)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-slate-200 text-slate-700'}`}
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleIntegrateParsedData}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all"
                      >
                        Integrate to Planner
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Pomodoro Focus Timer */}
          {activeTab === 'timer' && (
            <motion.div 
              key="timer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center py-6 w-full"
            >
              <div className={`w-full max-w-xl p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden ${isDark ? 'glass-card' : 'glass-card-light'}`}>
                
                {/* Clock display (Editable when paused) */}
                <div className="text-7xl md:text-8xl font-bold tracking-tighter tabular-nums select-none my-8 flex items-center justify-center">
                  {!timerActive ? (
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        min="1"
                        max="120"
                        value={timerMinutes} 
                        onChange={(e) => setTimerMinutes(Number(e.target.value))}
                        className={`w-28 md:w-36 bg-transparent text-right focus:outline-none ${isDark ? 'text-white' : 'text-slate-800'} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                      />
                      <span className="pb-1 md:pb-2 mx-1">:</span>
                      <span className="w-28 md:w-36 text-left">{String(timerSeconds).padStart(2, '0')}</span>
                    </div>
                  ) : (
                    <span>
                      {String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}
                    </span>
                  )}
                </div>

                <div className="w-full max-w-sm space-y-4 mb-8">
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block">Associate Study Task</label>
                  <select 
                    value={selectedCourseTimer}
                    onChange={(e) => setSelectedCourseTimer(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
                  >
                    <option value="">General Unassigned Study</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      setTimerActive(false);
                      setTimerMinutes(timerMode === 'work' ? 25 : 5);
                      setTimerSeconds(0);
                    }}
                    className={`p-3 border rounded-2xl transition-all ${isDark ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    title="Reset Session"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>

                  <button 
                    onClick={() => setTimerActive(!timerActive)}
                    className={`px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-md ${timerActive ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/10'}`}
                  >
                    {timerActive ? "Pause Flow" : "Start Focus Block"}
                  </button>

                  <button 
                    onClick={playCompletionBeep}
                    className={`p-3 border rounded-2xl transition-all ${isDark ? 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
                    title="Test Alert Sound"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 w-full flex justify-around text-sm text-gray-400 font-mono">
                  <div>
                    <span className={`block text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{pomodoroCount}</span>
                    <span>blocks done</span>
                  </div>
                  <div>
                    <span className="block text-xl font-bold text-emerald-500">{studySessions.length}</span>
                    <span>sessions logged</span>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* Zen Tutor Chat Module */}
          {activeTab === 'tutor' && (
            <motion.div 
              key="tutor"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className={`flex flex-col h-[520px] rounded-3xl overflow-hidden relative border ${isDark ? 'glass-card border-white/5' : 'glass-card-light border-slate-200 shadow-sm'}`}
            >
              {/* Chat Header */}
              <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight">Study Assistant Chat</h2>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Connected
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {aiConfig.provider === 'built-in' ? 'Acadly Cloud (3.5-flash)' : `Custom AI (${aiConfig.model})`}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((m) => (
                  <div 
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-100 dark:bg-[#1a1c23] text-slate-800 dark:text-gray-200 border border-slate-200/50 dark:border-white/10 rounded-bl-none'}`}>
                      <p className="whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                      <span className="block text-[9px] text-gray-400 font-mono mt-2 text-right">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className={`rounded-2xl rounded-bl-none p-4 flex items-center gap-2 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500 font-mono">Study Assistant is writing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t flex gap-3 ${isDark ? 'bg-neutral-950 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                <input 
                  type="text"
                  required
                  disabled={chatLoading}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask the Study Assistant: 'Plan out study guidelines for operating systems...' "
                  className={`flex-1 border rounded-xl px-4 py-3 text-sm placeholder:text-gray-450 focus:outline-none focus:border-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-850'}`}
                />
                <button 
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400 text-white font-bold rounded-xl text-sm transition-all"
                >
                  Send
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className={`mt-auto py-8 text-center text-[10px] font-mono tracking-wider border-t ${isDark ? 'text-gray-600 border-white/3' : 'text-slate-400 border-slate-200'}`}>
        © 2026 ACADLY • SLEEK MATHEMATICAL ACADEMIC COMPANION
      </footer>
    </div>
  );
}
