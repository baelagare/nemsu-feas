import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
  Users,
  Award,
  BarChart3,
  Sparkles,
  TrendingUp,
  Building,
  CheckCircle2,
  Calendar,
  FileText,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Download,
  Check,
  X,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Briefcase,
  Layers,
} from 'lucide-react';
import UniversitySeal from '../components/UniversitySeal';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../data/evaluationData';

/**
 * HR Administrative Analytics Console (Module 1).
 * Architectural precision: Linear / Stripe style ergonomics,
 * sticky tables, tabular numbers, real-time filtering, and zero gradient slop.
 */
export default function HRDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'departments' | 'faculty' | 'sentiment'
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/hr/login');
  };

  // Structured Department Performance Matrix
  const departmentStats = [
    {
      code: 'DCS',
      name: 'Department of Computer Studies',
      facultyCount: 5,
      total: 246,
      target: 260,
      completion: 94.6,
      avgRating: 4.72,
      status: 'High Turnout',
      trend: '+12.5%',
    },
    {
      code: 'DBM',
      name: 'Department of Business and Management',
      facultyCount: 4,
      total: 198,
      target: 225,
      completion: 88.0,
      avgRating: 4.61,
      status: 'On Track',
      trend: '+8.2%',
    },
    {
      code: 'DIT',
      name: 'Department of Industrial Technology',
      facultyCount: 4,
      total: 154,
      target: 185,
      completion: 83.2,
      avgRating: 4.58,
      status: 'On Track',
      trend: '+5.4%',
    },
    {
      code: 'DGTT',
      name: 'Department of General Teacher Education',
      facultyCount: 4,
      total: 132,
      target: 165,
      completion: 80.0,
      avgRating: 4.67,
      status: 'On Track',
      trend: '+4.1%',
    },
    {
      code: 'CCJE',
      name: 'College of Criminal Justice Education',
      facultyCount: 4,
      total: 112,
      target: 135,
      completion: 83.0,
      avgRating: 4.65,
      status: 'On Track',
      trend: '+6.8%',
    },
  ];

  // Top Performing Faculty Evaluated
  const facultyLeaderboard = [
    {
      name: 'Engr. Neil Joshua Ramos',
      dept: 'DCS',
      course: 'IT 211 / CS 101',
      rating: 4.88,
      responses: 78,
      status: 'Outstanding',
    },
    {
      name: 'Dr. Arthur Pendelton',
      dept: 'DBM',
      course: 'BM 301 / MGT 202',
      rating: 4.82,
      responses: 64,
      status: 'Outstanding',
    },
    {
      name: 'Atty. Ronald B. Dela Cruz',
      dept: 'CCJE',
      course: 'CLJ 101 / CRIM 210',
      rating: 4.79,
      responses: 58,
      status: 'Outstanding',
    },
    {
      name: 'Prof. Aileen Grace Morales',
      dept: 'DCS',
      course: 'CS 220 / IT 312',
      rating: 4.76,
      responses: 62,
      status: 'Very Satisfactory',
    },
    {
      name: 'Dr. Lourdes Mendoza',
      dept: 'DGTT',
      course: 'EDUC 101 / PROFED 4',
      rating: 4.74,
      responses: 52,
      status: 'Very Satisfactory',
    },
  ];

  // Qualitative Sentiment Theme Clusters (NLP Engine)
  const sentimentClusters = [
    {
      theme: 'Instructional Clarity & Concept Simplification',
      sentimentScore: 96.2,
      sampleComment: 'Explains complex algorithms and data structures using intuitive daily analogies.',
      mentions: 84,
      category: 'Pedagogy',
    },
    {
      theme: 'Punctuality & Structured Time Management',
      sentimentScore: 94.8,
      sampleComment: 'Maximizes the full class schedule and always starts sessions on time.',
      mentions: 67,
      category: 'Management',
    },
    {
      theme: 'Prompt Feedback on Quizzes & Laboratory Outputs',
      sentimentScore: 91.5,
      sampleComment: 'Returns lab exercises promptly with detailed notes for improvement.',
      mentions: 59,
      category: 'Transparency',
    },
    {
      theme: 'Constructive Consultation & Student Mentorship',
      sentimentScore: 89.0,
      sampleComment: 'Available during consultation hours and assists struggling students patiently.',
      mentions: 43,
      category: 'Commitment',
    },
  ];

  // Filtered department list based on search query
  const filteredDepartments = departmentStats.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* Top Administrative Bar */}
      <header className="bg-[#071D45] text-white border-b border-white/10 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#071D45] p-1 border border-white/15">
              <UniversitySeal className="h-full w-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-sm sm:text-base block leading-none">
                  NEMSU-FEAS
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-200 border border-white/10">
                  HR Portal
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block leading-tight">
                Human Resource Management Office &bull; Cantilan Campus
              </span>
            </div>
          </div>

          {/* User Profile Pill & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">
                {user?.name || 'Dr. Evelyn V. Ramos'}
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                {user?.role || 'HR Director'} &bull; {user?.staffId || 'HR-CAN-2024-01'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/10 hover:bg-rose-600/90 px-2.5 py-1.5 text-xs font-medium text-white border border-white/15 transition-colors focus-visible:outline-2 focus-visible:outline-amber-400"
              title="Sign Out of HR Portal"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Ribbon */}
        <div className="bg-[#0A2557] border-t border-white/10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto">
            <nav className="flex space-x-1" aria-label="Dashboard views">
              {[
                { id: 'overview', label: 'System Overview' },
                { id: 'departments', label: 'Department Matrix' },
                { id: 'faculty', label: 'Faculty Roster' },
                { id: 'sentiment', label: 'NLP Sentiment Themes' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-amber-400 text-white font-semibold'
                        : 'border-transparent text-slate-300 hover:text-white hover:border-slate-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2 py-1.5 text-[11px] text-slate-300 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>Evaluation Window: Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* ACTION TOOLBAR / FILTER ROW */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white p-3.5 border border-slate-200 shadow-card">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
              AY 2024–2025 &bull; 2nd Semester
            </span>
            <span className="hidden sm:inline text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">
              Cantilan Campus Quality Assurance
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter departments / faculty…"
                className="h-8 pl-8 pr-3 text-xs rounded-md border border-slate-300 bg-white placeholder-slate-400 focus:border-[#13469E] focus-visible:ring-1 focus-visible:ring-[#13469E] transition-colors w-48 sm:w-56"
              />
            </div>

            {/* Export Summary Report Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="h-8 inline-flex items-center gap-1.5 rounded-md bg-[#13469E] hover:bg-[#0E367C] px-3 text-xs font-medium text-white transition-colors shadow-subtle focus-visible:outline-2 focus-visible:outline-[#13469E]"
            >
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Generate Audit Report</span>
            </button>
          </div>
        </div>

        {/* KEY PERFORMANCE INDICATORS (KPIs) - Linear Style Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* KPI 1: Student Evaluations */}
          <div className="rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Student Responses
              </span>
              <span className="inline-flex items-center rounded font-mono text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                +18.4%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                842
              </span>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                / 980 target
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>85.9% Campus Turnout</span>
              <span className="font-mono text-[#13469E]">Active</span>
            </div>
          </div>

          {/* KPI 2: Faculty Evaluated */}
          <div className="rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Faculty Coverage
              </span>
              <span className="inline-flex items-center rounded font-mono text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                5 Depts
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                48
              </span>
              <span className="font-mono text-xs text-slate-400 tabular-nums">
                / 50 total roster
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>96.0% Faculty Assessed</span>
              <span className="font-mono text-emerald-600">Complete</span>
            </div>
          </div>

          {/* KPI 3: Institutional Mean Rating */}
          <div className="rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Composite Rating
              </span>
              <span className="inline-flex items-center rounded font-mono text-[10px] font-semibold text-[#13469E] bg-blue-50 px-1.5 py-0.5 border border-blue-200">
                CHED 5-Pt
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                4.64
              </span>
              <span className="font-mono text-xs text-slate-400">
                / 5.00
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-medium">Often to Always</span>
              <span className="font-mono text-slate-400">&plusmn;0.12 SE</span>
            </div>
          </div>

          {/* KPI 4: Sentiment Quality Index */}
          <div className="rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-card flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sentiment Quality
              </span>
              <span className="inline-flex items-center rounded font-mono text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                NLP Engine
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                92.4%
              </span>
              <span className="text-xs text-emerald-600 font-medium">
                Constructive
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>253 Remarks Analyzed</span>
              <span className="font-mono text-slate-400">4 Themes</span>
            </div>
          </div>
        </div>

        {/* MAIN ANALYTICS GRID: Department Matrix (7 Cols) & Insights / Roster (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Department Performance Data Grid (7 Cols) */}
          <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col justify-between overflow-hidden">
            <div>
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    Academic Department Coverage
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live student evaluation turnouts and composite ratings
                  </p>
                </div>
                <span className="font-mono text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {filteredDepartments.length} Departments
                </span>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Department</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Responses</th>
                      <th className="py-2.5 px-3 font-semibold">Turnout Rate</th>
                      <th className="py-2.5 px-3 text-right font-semibold">Mean Rating</th>
                      <th className="py-2.5 px-4 text-center font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDepartments.map((dept) => (
                      <tr key={dept.code} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{dept.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{dept.code} &bull; {dept.facultyCount} Faculty</div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-700">
                          {dept.total} <span className="text-slate-400">/ {dept.target}</span>
                        </td>
                        <td className="py-3 px-3 w-32">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-[#13469E] rounded-full"
                                style={{ width: `${dept.completion}%` }}
                              />
                            </div>
                            <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-700">
                              {dept.completion}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                          {dept.avgRating.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${
                            dept.status === 'High Turnout'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table Footer */}
            <div className="p-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px]">842 of ~980 student targets reached</span>
              <span className="font-semibold text-emerald-700 font-mono text-[11px]">85.9% Campus-Wide Turnout</span>
            </div>
          </div>

          {/* Right Column: Faculty Roster & Sentiment Insights (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Faculty Engagement Roster Card */}
            <div className="rounded-xl bg-white border border-slate-200 shadow-card p-4 sm:p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Top Evaluated Faculty Roster
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Leading instruction ratings this term
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#13469E] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    SET &ge; 4.70
                  </span>
                </div>

                <div className="space-y-2">
                  {facultyLeaderboard.slice(0, 4).map((fac) => (
                    <div
                      key={fac.name}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {fac.name}
                        </p>
                        <p className="font-mono text-[10px] text-slate-500 truncate">
                          {fac.dept} &bull; {fac.course}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-xs font-bold text-[#13469E] tabular-nums">
                          {fac.rating.toFixed(2)}
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400 tabular-nums">
                          {fac.responses} evals
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NLP Sentiment & Thematic Intelligence */}
            <div className="rounded-xl bg-white border border-slate-200 shadow-card p-4 sm:p-5">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#13469E]" aria-hidden="true" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                    NLP Sentiment Theme Clusters
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  92.4% Pos
                </span>
              </div>

              <div className="space-y-2">
                {sentimentClusters.slice(0, 2).map((item) => (
                  <div key={item.theme} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-800 truncate mr-2">
                        {item.theme}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 tabular-nums shrink-0">
                        {item.sentimentScore}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic line-clamp-2">
                      &ldquo;{item.sampleComment}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actionable Faculty Interventions */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5">
              <div className="flex items-center gap-2 mb-1.5 text-slate-900">
                <Briefcase className="h-3.5 w-3.5 text-[#13469E]" aria-hidden="true" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider">
                  HR Actionable Interventions
                </h4>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                <li>Schedule active learning &amp; rubric workshop for instructors.</li>
                <li>Optimize departmental consultation hour scheduling blocks.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Generate Summary Audit Report Modal */}
        {showExportModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          >
            <div className="w-full max-w-2xl rounded-xl bg-white p-5 sm:p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-[#13469E] border border-slate-200">
                    <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="report-modal-title" className="text-sm font-bold text-slate-900">
                      Consolidated Faculty Evaluation Audit Report
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      NEMSU-FEAS &bull; AY 2024–2025 (2nd Semester) &bull; Cantilan Campus
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  aria-label="Close report dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700 mb-5">
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Total Evaluations:</span>
                    <span className="font-bold text-slate-900 text-sm tabular-nums">842</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Campus Turnout:</span>
                    <span className="font-bold text-emerald-700 text-sm tabular-nums">85.9%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Composite Rating:</span>
                    <span className="font-bold text-[#13469E] text-sm tabular-nums">4.64 / 5.0</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-100 text-slate-600 font-mono text-[10px] uppercase">
                      <tr>
                        <th className="p-2">Academic Department</th>
                        <th className="p-2 text-right">Responses</th>
                        <th className="p-2 text-right">Completion</th>
                        <th className="p-2 text-right">Mean Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {departmentStats.map((d) => (
                        <tr key={d.code} className="hover:bg-slate-50">
                          <td className="p-2 font-sans font-medium text-slate-900">{d.name}</td>
                          <td className="p-2 text-right tabular-nums">{d.total}</td>
                          <td className="p-2 text-right tabular-nums">{d.completion}%</td>
                          <td className="p-2 text-right font-bold tabular-nums">{d.avgRating.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Certified official institutional report generated by <strong>{user?.name || 'HR Director'}</strong>. Compliant with Commission on Higher Education (CHED) Memorandum Orders for State Universities and Colleges.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="h-8 px-3.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Audit report successfully prepared for export.');
                    setShowExportModal(false);
                  }}
                  className="h-8 px-3.5 rounded-lg bg-[#13469E] hover:bg-[#0E367C] text-xs font-semibold text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Download Signed PDF / CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Institutional Footer */}
        <Footer />
      </main>
    </div>
  );
}
