import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Users,
  BarChart3,
  Building2,
  CheckCircle2,
  FileText,
  ChevronRight,
  Search,
  Download,
  X,
  FileSpreadsheet,
  MessageSquare,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  Printer,
} from 'lucide-react';
import UniversitySeal from '../components/UniversitySeal';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../data/evaluationData';

/**
 * HR & Academic Deans Administrative Analytics Portal.
 * Strictly Navy Blue (#0B2545) & White institutional design system,
 * Plus Jakarta Sans tabular typography, and complete interactive functionality
 * across all 4 tabs (System Overview, Department Matrix, Faculty Roster, Qualitative Feedback).
 */

// Complete structured dataset covering all 5 departments and 21 faculty members
const DEPARTMENT_METRICS = [
  {
    code: 'DCS',
    name: 'Department of Computer Studies',
    dean: '[PLACEHOLDER: Department Dean / Chair]',
    facultyCount: 5,
    evaluatedCount: 5,
    totalResponses: 246,
    targetResponses: 260,
    completion: 94.6,
    sectionA: 4.76,
    sectionB: 4.71,
    sectionC: 4.69,
    avgRating: 4.72,
    status: 'High Turnout',
  },
  {
    code: 'DBM',
    name: 'Department of Business and Management',
    dean: '[PLACEHOLDER: Department Dean / Chair]',
    facultyCount: 4,
    evaluatedCount: 4,
    totalResponses: 198,
    targetResponses: 225,
    completion: 88.0,
    sectionA: 4.64,
    sectionB: 4.59,
    sectionC: 4.60,
    avgRating: 4.61,
    status: 'On Track',
  },
  {
    code: 'DIT',
    name: 'Department of Industrial Technology',
    dean: '[PLACEHOLDER: Department Dean / Chair]',
    facultyCount: 4,
    evaluatedCount: 4,
    totalResponses: 154,
    targetResponses: 185,
    completion: 83.2,
    sectionA: 4.55,
    sectionB: 4.62,
    sectionC: 4.57,
    avgRating: 4.58,
    status: 'On Track',
  },
  {
    code: 'DGTT',
    name: 'Department of General Teacher Education',
    dean: '[PLACEHOLDER: Department Dean / Chair]',
    facultyCount: 4,
    evaluatedCount: 4,
    totalResponses: 132,
    targetResponses: 165,
    completion: 80.0,
    sectionA: 4.70,
    sectionB: 4.65,
    sectionC: 4.66,
    avgRating: 4.67,
    status: 'On Track',
  },
  {
    code: 'CCJE',
    name: 'College of Criminal Justice Education',
    dean: '[PLACEHOLDER: Department Dean / Chair]',
    facultyCount: 4,
    evaluatedCount: 4,
    totalResponses: 112,
    targetResponses: 135,
    completion: 83.0,
    sectionA: 4.68,
    sectionB: 4.61,
    sectionC: 4.66,
    avgRating: 4.65,
    status: 'On Track',
  },
];

// Full 21-member Faculty Evaluation Roster aligned with DEPARTMENTS in evaluationData.js
const FULL_FACULTY_ROSTER = [
  // DCS (5)
  { id: 'f-1', name: 'Engr. Neil Joshua Ramos', dept: 'DCS', deptName: 'Department of Computer Studies', courses: 'IT 211 / CS 101', responses: 78, sectionA: 4.91, sectionB: 4.86, sectionC: 4.87, rating: 4.88, status: 'Outstanding', sampleRemark: 'Explains complex algorithms and data structures using clear, practical examples.' },
  { id: 'f-2', name: 'Prof. Aileen Grace Morales', dept: 'DCS', deptName: 'Department of Computer Studies', courses: 'CS 220 / IT 312', responses: 62, sectionA: 4.78, sectionB: 4.75, sectionC: 4.75, rating: 4.76, status: 'Outstanding', sampleRemark: 'Provides structured laboratory guides and timely feedback on programming exercises.' },
  { id: 'f-3', name: 'Dr. Bryan Christopher Cruz', dept: 'DCS', deptName: 'Department of Computer Studies', courses: 'CS 301 / IT 401', responses: 41, sectionA: 4.72, sectionB: 4.70, sectionC: 4.68, rating: 4.70, status: 'Outstanding', sampleRemark: 'Encourages critical thinking during capstone consultations and code reviews.' },
  { id: 'f-4', name: 'Mr. Mark Kevin Tan', dept: 'DCS', deptName: 'Department of Computer Studies', courses: 'IT 102 / CS 110', responses: 35, sectionA: 4.66, sectionB: 4.62, sectionC: 4.64, rating: 4.64, status: 'Very Satisfactory', sampleRemark: 'Starts classes on time and shares complete course slides after every lecture.' },
  { id: 'f-5', name: 'Ms. Mary Hazel Diaz', dept: 'DCS', deptName: 'Department of Computer Studies', courses: 'IT 204 / GE 105', responses: 30, sectionA: 4.65, sectionB: 4.60, sectionC: 4.61, rating: 4.62, status: 'Very Satisfactory', sampleRemark: 'Clear grading rubrics and approachable during scheduled consultation hours.' },
  // DBM (4)
  { id: 'f-6', name: 'Dr. Arthur Pendelton', dept: 'DBM', deptName: 'Department of Business and Management', courses: 'BM 301 / MGT 202', responses: 64, sectionA: 4.85, sectionB: 4.80, sectionC: 4.81, rating: 4.82, status: 'Outstanding', sampleRemark: 'Connects financial management concepts to local enterprise case studies.' },
  { id: 'f-7', name: 'Prof. Maria Santos', dept: 'DBM', deptName: 'Department of Business and Management', courses: 'MKT 101 / BM 210', responses: 51, sectionA: 4.68, sectionB: 4.63, sectionC: 4.64, rating: 4.65, status: 'Very Satisfactory', sampleRemark: 'Well-organized syllabus and transparent computation of midterm and final grades.' },
  { id: 'f-8', name: 'Prof. Karen Mae Dizon', dept: 'DBM', deptName: 'Department of Business and Management', courses: 'ACTG 101 / BM 105', responses: 45, sectionA: 4.54, sectionB: 4.50, sectionC: 4.52, rating: 4.52, status: 'Very Satisfactory', sampleRemark: 'Provides helpful problem sets that prepare students well for departmental exams.' },
  { id: 'f-9', name: 'Mr. Jonathan B. Flores', dept: 'DBM', deptName: 'Department of Business and Management', courses: 'ENTREP 201 / BM 215', responses: 38, sectionA: 4.48, sectionB: 4.43, sectionC: 4.44, rating: 4.45, status: 'Very Satisfactory', sampleRemark: 'Interactive group discussions, though additional review sessions before exams would help.' },
  // DIT (4)
  { id: 'f-10', name: 'Engr. Roberto Alcantara', dept: 'DIT', deptName: 'Department of Industrial Technology', courses: 'IND 201 / TECH 104', responses: 46, sectionA: 4.70, sectionB: 4.72, sectionC: 4.68, rating: 4.70, status: 'Outstanding', sampleRemark: 'Demonstrates strong hands-on mastery during workshop and laboratory sessions.' },
  { id: 'f-11', name: 'Prof. Danilo Villanueva', dept: 'DIT', deptName: 'Department of Industrial Technology', courses: 'AUTO 102 / IND 110', responses: 40, sectionA: 4.58, sectionB: 4.63, sectionC: 4.59, rating: 4.60, status: 'Very Satisfactory', sampleRemark: 'Emphasizes workshop safety protocols and clear practical assessment criteria.' },
  { id: 'f-12', name: 'Ms. Jennifer Ocampo', dept: 'DIT', deptName: 'Department of Industrial Technology', courses: 'DRAFT 101 / TECH 202', responses: 36, sectionA: 4.50, sectionB: 4.58, sectionC: 4.54, rating: 4.54, status: 'Very Satisfactory', sampleRemark: 'Gives detailed step-by-step feedback on technical plates and CAD submissions.' },
  { id: 'f-13', name: 'Engr. Glenn Arreza', dept: 'DIT', deptName: 'Department of Industrial Technology', courses: 'ELEC 201 / IND 301', responses: 32, sectionA: 4.42, sectionB: 4.55, sectionC: 4.47, rating: 4.48, status: 'Very Satisfactory', sampleRemark: 'Thorough laboratory demonstrations; students appreciate the extra troubleshooting guides.' },
  // DGTT (4)
  { id: 'f-14', name: 'Dr. Lourdes Mendoza', dept: 'DGTT', deptName: 'Department of General Teacher Education', courses: 'EDUC 101 / PROFED 4', responses: 52, sectionA: 4.77, sectionB: 4.72, sectionC: 4.73, rating: 4.74, status: 'Outstanding', sampleRemark: 'Models effective classroom management and inclusive teaching strategies.' },
  { id: 'f-15', name: 'Prof. Francisca Reyes', dept: 'DGTT', deptName: 'Department of General Teacher Education', courses: 'PROFED 6 / EDUC 203', responses: 31, sectionA: 4.71, sectionB: 4.66, sectionC: 4.67, rating: 4.68, status: 'Very Satisfactory', sampleRemark: 'Provides constructive critiques on lesson plans and micro-teaching demonstrations.' },
  { id: 'f-16', name: 'Dr. Elena M. Gomez', dept: 'DGTT', deptName: 'Department of General Teacher Education', courses: 'GE 101 / EDUC 108', responses: 26, sectionA: 4.68, sectionB: 4.62, sectionC: 4.65, rating: 4.65, status: 'Very Satisfactory', sampleRemark: 'Fosters an engaging, respectful learning environment where all students participate.' },
  { id: 'f-17', name: 'Mr. Joseph Aranas', dept: 'DGTT', deptName: 'Department of General Teacher Education', courses: 'PE 102 / PROFED 2', responses: 23, sectionA: 4.64, sectionB: 4.60, sectionC: 4.59, rating: 4.61, status: 'Very Satisfactory', sampleRemark: 'Clear performance rubrics and consistent adherence to the course schedule.' },
  // CCJE (4)
  { id: 'f-18', name: 'Atty. Ronald B. Dela Cruz', dept: 'CCJE', deptName: 'College of Criminal Justice Education', courses: 'CLJ 101 / CRIM 210', responses: 58, sectionA: 4.82, sectionB: 4.77, sectionC: 4.78, rating: 4.79, status: 'Outstanding', sampleRemark: 'Presents criminal law jurisprudence with clarity and rigorous Socratic questioning.' },
  { id: 'f-19', name: 'Capt. Eduardo M. Soriano', dept: 'CCJE', deptName: 'College of Criminal Justice Education', courses: 'CDI 101 / CRIM 105', responses: 22, sectionA: 4.66, sectionB: 4.60, sectionC: 4.63, rating: 4.63, status: 'Very Satisfactory', sampleRemark: 'Shares practical field investigation procedures aligned with course outcomes.' },
  { id: 'f-20', name: 'Prof. Catherine Joy Perez', dept: 'CCJE', deptName: 'College of Criminal Justice Education', courses: 'CRIM 101 / SOC 102', responses: 18, sectionA: 4.62, sectionB: 4.55, sectionC: 4.63, rating: 4.60, status: 'Very Satisfactory', sampleRemark: 'Organized lecture modules and prompt return of graded written examinations.' },
  { id: 'f-21', name: 'Mr. Victoriano S. Balane', dept: 'CCJE', deptName: 'College of Criminal Justice Education', courses: 'FORENSIC 1 / DT 101', responses: 14, sectionA: 4.62, sectionB: 4.52, sectionC: 4.60, rating: 4.58, status: 'Very Satisfactory', sampleRemark: 'Clear laboratory instructions and fair evaluation of practical exercises.' },
];

// Qualitative Feedback Themes & Anonymized Student Remarks
const QUALITATIVE_FEEDBACK_THEMES = [
  {
    id: 'theme-1',
    theme: 'Instructional Clarity & Concept Simplification',
    category: 'Pedagogy',
    sectionRef: 'Section B: Content, Knowledge, Pedagogy & Technology',
    positiveRate: 96.2,
    mentions: 84,
    summary: 'Students consistently commend instructors who break down complex technical or theoretical topics using step-by-step demonstrations and local examples.',
    remarks: [
      { id: 'r-1', dept: 'DCS', course: 'IT 211', text: 'Explains complex algorithms and data structures using clear, practical analogies that make coding easier to grasp.' },
      { id: 'r-2', dept: 'CCJE', course: 'CLJ 101', text: 'Presents criminal law provisions systematically and connects every article to real Supreme Court cases.' },
      { id: 'r-3', dept: 'DBM', course: 'BM 301', text: 'Simplifies financial ratio analysis with step-by-step board examples before giving seatwork.' },
    ],
  },
  {
    id: 'theme-2',
    theme: 'Punctuality & Structured Time Management',
    category: 'Management',
    sectionRef: 'Section A: Management of Teaching and Learning',
    positiveRate: 94.8,
    mentions: 67,
    summary: 'High ratings are strongly correlated with instructors who begin sessions promptly, follow the syllabus timeline, and maximize laboratory/lecture hours.',
    remarks: [
      { id: 'r-4', dept: 'DCS', course: 'CS 101', text: 'Maximizes the full class schedule, starts sessions on time, and posts the weekly learning agenda ahead of class.' },
      { id: 'r-5', dept: 'DGTT', course: 'EDUC 101', text: 'Follows the course syllabus closely so students always know upcoming requirements and reading assignments.' },
    ],
  },
  {
    id: 'theme-3',
    theme: 'Grading Transparency & Prompt Assessment Feedback',
    category: 'Transparency',
    sectionRef: 'Section C: Commitment and Transparency',
    positiveRate: 91.5,
    mentions: 59,
    summary: 'Evaluators value receiving clear grading rubrics at the start of the term and getting graded quizzes, plates, and lab outputs returned prior to major exams.',
    remarks: [
      { id: 'r-6', dept: 'DIT', course: 'DRAFT 101', text: 'Returns technical plates promptly with specific annotations on how to improve line weights and dimensions.' },
      { id: 'r-7', dept: 'DBM', course: 'MKT 101', text: 'Explains the exact grading rubric for project presentations and shows transparent midterm grade computations.' },
    ],
  },
  {
    id: 'theme-4',
    theme: 'Consultation Availability & Student Mentorship',
    category: 'Commitment',
    sectionRef: 'Section C: Commitment and Transparency',
    positiveRate: 89.0,
    mentions: 43,
    summary: 'Students highlight the importance of accessible departmental consultation hours for capstone advising, remedial guidance, and academic support.',
    remarks: [
      { id: 'r-8', dept: 'DCS', course: 'IT 401', text: 'Available during scheduled consultation hours and patiently guides groups through thesis architecture revisions.' },
      { id: 'r-9', dept: 'DGTT', course: 'PROFED 4', text: 'Very approachable when students ask for clarification on lesson plan formatting outside lecture hours.' },
    ],
  },
];

export default function HRDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & Interactive Filter State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'departments' | 'faculty' | 'sentiment'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [facultySortBy, setFacultySortBy] = useState('rating-desc'); // 'rating-desc' | 'rating-asc' | 'responses-desc' | 'name-asc'
  const [feedbackCategory, setFeedbackCategory] = useState('ALL');

  // Modals / Drawers
  const [selectedFacultyDetail, setSelectedFacultyDetail] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/hr/login');
  };

  // Jump to Faculty Roster filtered by a specific department
  const handleInspectDepartmentRoster = (deptCode) => {
    setSelectedDeptFilter(deptCode);
    setActiveTab('faculty');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return DEPARTMENT_METRICS.filter((dept) => {
      const matchesDept = selectedDeptFilter === 'ALL' || dept.code === selectedDeptFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [selectedDeptFilter, searchQuery]);

  // Filtered & Sorted Faculty Roster
  const filteredFaculty = useMemo(() => {
    const filtered = FULL_FACULTY_ROSTER.filter((fac) => {
      const matchesDept = selectedDeptFilter === 'ALL' || fac.dept === selectedDeptFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || fac.status === selectedStatusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.courses.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fac.deptName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (facultySortBy === 'rating-desc') return b.rating - a.rating;
      if (facultySortBy === 'rating-asc') return a.rating - b.rating;
      if (facultySortBy === 'responses-desc') return b.responses - a.responses;
      if (facultySortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [selectedDeptFilter, selectedStatusFilter, searchQuery, facultySortBy]);

  // Filtered Qualitative Feedback Themes
  const filteredFeedbackThemes = useMemo(() => {
    return QUALITATIVE_FEEDBACK_THEMES.filter((item) => {
      const matchesCategory = feedbackCategory === 'ALL' || item.category === feedbackCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        item.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.remarks.some(
          (r) =>
            r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.dept.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [feedbackCategory, searchQuery]);

  // Real CSV Export Handler for Testing
  const handleDownloadCSV = () => {
    const headers = [
      'Faculty Name',
      'Department Code',
      'Department Name',
      'Courses',
      'Student Responses',
      'Section A (Management)',
      'Section B (Pedagogy)',
      'Section C (Transparency)',
      'Composite Mean Rating',
      'Descriptive Rating',
    ];
    const rows = FULL_FACULTY_ROSTER.map((f) => [
      `"${f.name}"`,
      f.dept,
      `"${f.deptName}"`,
      `"${f.courses}"`,
      f.responses,
      f.sectionA.toFixed(2),
      f.sectionB.toFixed(2),
      f.sectionC.toFixed(2),
      f.rating.toFixed(2),
      `"${f.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'nemsu-feas-faculty-evaluation-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccessMessage(
      'CSV report (nemsu-feas-faculty-evaluation-report.csv) downloaded.'
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedDeptFilter('ALL');
    setSelectedStatusFilter('ALL');
    setFeedbackCategory('ALL');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedDeptFilter !== 'ALL' ||
    selectedStatusFilter !== 'ALL' ||
    feedbackCategory !== 'ALL';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* TOP INSTITUTIONAL BAR — Strict Navy Blue (#0B2545) & White */}
      <header className="bg-[#0B2545] text-white sticky top-0 z-30 shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 border border-white/20">
              <UniversitySeal className="h-full w-full" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block leading-none mb-1 truncate">
                NEMSU &bull; Cantilan Campus
              </span>
              <h1 className="font-extrabold tracking-tight text-sm sm:text-base text-white block leading-none truncate">
                HR &amp; Administrative Analytics Portal
              </h1>
            </div>
          </div>

          {/* Authenticated User Identity & Sign Out */}
          <div className="flex items-center gap-3.5 shrink-0">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                {user?.name || '[PLACEHOLDER: Administrator Name]'}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {user?.role || 'HR Administrator'} &bull; {user?.staffId || '[PLACEHOLDER: Staff ID]'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
              title="Sign Out of HR Portal"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation Tab Bar */}
        <div className="bg-[#071930] border-t border-white/15 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto">
            <nav className="flex space-x-1" aria-label="Dashboard sections" role="tablist">
              {[
                { id: 'overview', label: 'System Overview', count: null },
                { id: 'departments', label: 'Department Matrix', count: DEPARTMENT_METRICS.length },
                { id: 'faculty', label: 'Faculty Roster', count: FULL_FACULTY_ROSTER.length },
                { id: 'sentiment', label: 'Qualitative Feedback', count: QUALITATIVE_FEEDBACK_THEMES.length },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-3 text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-white text-white font-extrabold bg-white/5'
                        : 'border-transparent text-slate-300 font-semibold hover:text-white hover:border-white/40'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                          isActive
                            ? 'bg-white text-[#0B2545]'
                            : 'bg-white/10 text-slate-200'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="hidden lg:flex items-center gap-2 py-2 text-xs font-semibold text-slate-300 shrink-0">
              <span className="h-2 w-2 rounded-full bg-white" aria-hidden="true" />
              <span>Academic Period: [PLACEHOLDER: AY / Semester]</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* GLOBAL FILTER & ACTION TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold text-[#0B2545] border border-slate-200">
              [PLACEHOLDER: AY / Semester]
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {activeTab === 'overview' && 'Institutional Evaluation Overview'}
                {activeTab === 'departments' && 'Academic Department Performance Matrix'}
                {activeTab === 'faculty' && 'Complete Faculty Evaluation Roster'}
                {activeTab === 'sentiment' && 'Anonymized Student Feedback & Themes'}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Department Filter Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="dashboard-dept-filter" className="sr-only">
                Filter by Department
              </label>
              <select
                id="dashboard-dept-filter"
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors"
              >
                <option value="ALL">All Departments (5)</option>
                {DEPARTMENT_METRICS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} &ndash; {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search
                className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty, course, or dept..."
                aria-label="Search faculty, course, or department"
                className="h-10 w-full sm:w-60 pl-9 pr-8 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Clear search query"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="h-10 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Reset Filters
              </button>
            )}

            {/* Generate Audit Report CTA */}
            <button
              type="button"
              onClick={() => {
                setExportSuccessMessage('');
                setShowExportModal(true);
              }}
              className="h-10 inline-flex items-center gap-2 rounded-lg bg-[#0B2545] hover:bg-[#133C6E] active:bg-[#040F21] px-4 text-xs sm:text-sm font-bold text-white transition-colors shadow-subtle whitespace-nowrap"
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Export Audit Report</span>
            </button>
          </div>
        </div>

        {/* ===================================================================
            TAB 1: SYSTEM OVERVIEW
        =================================================================== */}
        {activeTab === 'overview' && (
          <>
            {/* 4-COLUMN KPI SUMMARY CARDS — Strict Navy & White */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1 */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-card flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Student Submissions
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-[#0B2545] border border-slate-200">
                    85.9% Turnout
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    842
                  </span>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    of 980 target
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span> Verified Single-Entry</span>
                  <span className="font-bold text-[#0B2545]">[PLACEHOLDER: Status]</span>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-card flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Faculty Evaluated
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-[#0B2545] border border-slate-200">
                    5 Departments
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    21
                  </span>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    of 21 active roster
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>100% Roster Coverage</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('faculty')}
                    className="font-bold text-[#0B2545] hover:underline"
                  >
                    View Roster &rarr;
                  </button>
                </div>
              </div>

              {/* KPI 3 */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-card flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Institutional Mean
                  </span>
                  <span className="rounded-md bg-[#0B2545] px-2 py-0.5 text-xs font-bold text-white">
                    5-Point Scale
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    4.64
                  </span>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    / 5.00
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">Often to Always Manifested</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('departments')}
                    className="font-bold text-[#0B2545] hover:underline"
                  >
                    By Dept &rarr;
                  </button>
                </div>
              </div>

              {/* KPI 4 */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-card flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Written Remarks
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-[#0B2545] border border-slate-200">
                    4 Core Themes
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 tabular-nums">
                    253
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    student comments
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>92.4% Constructive</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sentiment')}
                    className="font-bold text-[#0B2545] hover:underline"
                  >
                    Read Remarks &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* MAIN ANALYTICS GRID: Department Coverage (7 Cols) & Roster/Feedback Previews (5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Department Performance Table */}
              <div className="lg:col-span-7 rounded-xl bg-white border border-slate-200 shadow-card flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Academic Department Coverage
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                        Select any department row to inspect its faculty evaluation roster.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('departments')}
                      className="text-xs font-bold text-[#0B2545] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Full Department Matrix</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="py-3.5 px-5 font-bold">Department</th>
                          <th className="py-3.5 px-3 text-right font-bold">Responses</th>
                          <th className="py-3.5 px-4 font-bold">Turnout</th>
                          <th className="py-3.5 px-3 text-right font-bold">Mean</th>
                          <th className="py-3.5 px-4 text-right font-bold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {filteredDepartments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 px-5 text-center text-sm text-slate-500">
                              No departments match your current filter.
                            </td>
                          </tr>
                        ) : (
                          filteredDepartments.map((dept) => (
                            <tr
                              key={dept.code}
                              onClick={() => handleInspectDepartmentRoster(dept.code)}
                              className="hover:bg-slate-50 cursor-pointer transition-colors group"
                            >
                              <td className="py-4 px-5">
                                <div className="font-bold text-slate-900 group-hover:text-[#0B2545]">
                                  {dept.name}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {dept.code} &bull; {dept.facultyCount} Faculty Members
                                </div>
                              </td>
                              <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-800 whitespace-nowrap">
                                {dept.totalResponses}{' '}
                                <span className="text-slate-400 font-normal">/ {dept.targetResponses}</span>
                              </td>
                              <td className="py-4 px-4 w-36">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
                                    <div
                                      className="h-full bg-[#0B2545] rounded-full"
                                      style={{ width: `${dept.completion}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold tabular-nums text-slate-800 w-10 text-right">
                                    {dept.completion}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-3 text-right">
                                <span className="inline-flex items-center justify-center rounded-md bg-[#0B2545] px-2 py-1 text-xs font-extrabold text-white tabular-nums">
                                  {dept.avgRating.toFixed(2)}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B2545] group-hover:underline whitespace-nowrap">
                                  <span>Roster</span>
                                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="font-medium">
                    Total Verified Responses: <strong className="font-bold text-slate-900 tabular-nums">842 / 980</strong>
                  </span>
                  <span className="font-bold text-[#0B2545] tabular-nums">
                    85.9% Campus-Wide Turnout
                  </span>
                </div>
              </div>

              {/* Right 5 Cols: Top Faculty & Qualitative Themes Preview */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Leading Faculty Roster Card */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Highest Rated Faculty
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Click any instructor to inspect their domain breakdown
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('faculty')}
                      className="text-xs font-bold text-[#0B2545] hover:underline whitespace-nowrap"
                    >
                      All {FULL_FACULTY_ROSTER.length} Faculty &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {filteredFaculty.slice(0, 4).map((fac) => (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => setSelectedFacultyDetail(fac)}
                        className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#0B2545] hover:bg-slate-50/80 transition-colors flex items-center justify-between text-left group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[#0B2545] truncate">
                            {fac.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {fac.dept} &bull; {fac.courses}
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-3">
                          <div>
                            <span className="block text-sm font-extrabold text-[#0B2545] tabular-nums">
                              {fac.rating.toFixed(2)}
                            </span>
                            <span className="block text-[11px] font-medium text-slate-500 tabular-nums">
                              {fac.responses} evals
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#0B2545]" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualitative Feedback Themes Preview */}
                <div className="rounded-xl bg-white border border-slate-200 shadow-card p-5">
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Student Feedback Themes
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        recurring observations from written remarks
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('sentiment')}
                      className="text-xs font-bold text-[#0B2545] hover:underline whitespace-nowrap"
                    >
                      View Remarks &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {QUALITATIVE_FEEDBACK_THEMES.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            {item.theme}
                          </span>
                          <span className="rounded bg-[#0B2545] px-2 py-0.5 text-xs font-bold text-white tabular-nums shrink-0">
                            {item.mentions} mentions
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          &ldquo;{item.remarks[0].text}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===================================================================
            TAB 2: DEPARTMENT MATRIX (Full Domain Breakdown & Comparison)
        =================================================================== */}
        {activeTab === 'departments' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block mb-1">
                    Departmental Rubric Comparison
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Section A, B, and C Domain Averages by Department
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Compare student turnout and standardized 5-point rubric scores across academic units.
                  </p>
                </div>
                <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 border border-slate-200">
                  Showing {filteredDepartments.length} of {DEPARTMENT_METRICS.length} Departments
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5 font-bold">Academic Department</th>
                      <th className="py-3.5 px-3 text-center font-bold">Faculty</th>
                      <th className="py-3.5 px-4 font-bold">Student Turnout</th>
                      <th className="py-3.5 px-3 text-right font-bold" title="Section A: Management of Teaching and Learning">
                        Sec A (Mgmt)
                      </th>
                      <th className="py-3.5 px-3 text-right font-bold" title="Section B: Content, Knowledge, Pedagogy and Technology">
                        Sec B (Pedagogy)
                      </th>
                      <th className="py-3.5 px-3 text-right font-bold" title="Section C: Commitment and Transparency">
                        Sec C (Transp.)
                      </th>
                      <th className="py-3.5 px-4 text-right font-bold">Composite Mean</th>
                      <th className="py-3.5 px-5 text-right font-bold">Department Roster</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDepartments.map((dept) => (
                      <tr key={dept.code} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900">{dept.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Code: <strong className="font-semibold text-slate-700">{dept.code}</strong> &bull; {dept.dean}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center tabular-nums font-semibold text-slate-800">
                          {dept.evaluatedCount} / {dept.facultyCount}
                        </td>
                        <td className="py-4 px-4 w-44">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-slate-800 tabular-nums">{dept.completion}%</span>
                            <span className="text-slate-500 tabular-nums">
                              {dept.totalResponses}/{dept.targetResponses}
                            </span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-[#0B2545] rounded-full"
                              style={{ width: `${dept.completion}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-700">
                          {dept.sectionA.toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-700">
                          {dept.sectionB.toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-700">
                          {dept.sectionC.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center justify-center rounded-md bg-[#0B2545] px-2.5 py-1 text-xs sm:text-sm font-extrabold text-white tabular-nums">
                            {dept.avgRating.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspectDepartmentRoster(dept.code)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#0B2545] hover:border-[#0B2545] hover:bg-slate-50 transition-colors whitespace-nowrap"
                          >
                            <span>View {dept.facultyCount} Faculty</span>
                            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: FACULTY ROSTER (Complete 21-Faculty Directory & Inspector)
        =================================================================== */}
        {activeTab === 'faculty' && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
              {/* Roster Sub-Header & Sort Controls */}
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block mb-1">
                    Individual Instructor Performance
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Evaluated Faculty Roster ({filteredFaculty.length} of {FULL_FACULTY_ROSTER.length})
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Click any instructor row or &ldquo;Inspect Report&rdquo; to view their Section A/B/C scores and student remarks.
                  </p>
                </div>

                {/* Rating Status Filter & Sort Order */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    aria-label="Filter by Descriptive Rating"
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0B2545]"
                  >
                    <option value="ALL">All Rating Tiers</option>
                    <option value="Outstanding">Outstanding (4.70 &ndash; 5.00)</option>
                    <option value="Very Satisfactory">Very Satisfactory (4.00 &ndash; 4.69)</option>
                  </select>

                  <select
                    value={facultySortBy}
                    onChange={(e) => setFacultySortBy(e.target.value)}
                    aria-label="Sort Faculty Roster"
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#0B2545]"
                  >
                    <option value="rating-desc">Sort: Highest Rating First</option>
                    <option value="rating-asc">Sort: Lowest Rating First</option>
                    <option value="responses-desc">Sort: Most Responses</option>
                    <option value="name-asc">Sort: Name (A &ndash; Z)</option>
                  </select>
                </div>
              </div>

              {/* Faculty Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5 font-bold">Faculty Member</th>
                      <th className="py-3.5 px-3 font-bold">Dept</th>
                      <th className="py-3.5 px-3 font-bold">Courses Evaluated</th>
                      <th className="py-3.5 px-3 text-right font-bold">Responses</th>
                      <th className="py-3.5 px-3 text-right font-bold">Sec A</th>
                      <th className="py-3.5 px-3 text-right font-bold">Sec B</th>
                      <th className="py-3.5 px-3 text-right font-bold">Sec C</th>
                      <th className="py-3.5 px-4 text-right font-bold">Composite</th>
                      <th className="py-3.5 px-5 text-right font-bold">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredFaculty.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 px-5 text-center text-sm text-slate-500">
                          No faculty members match your filter criteria.{' '}
                          <button
                            type="button"
                            onClick={resetAllFilters}
                            className="font-bold text-[#0B2545] underline ml-1"
                          >
                            Reset filters
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredFaculty.map((fac) => (
                        <tr
                          key={fac.id}
                          onClick={() => setSelectedFacultyDetail(fac)}
                          className="hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{fac.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{fac.status}</div>
                          </td>
                          <td className="py-4 px-3">
                            <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-[#0B2545] border border-slate-200">
                              {fac.dept}
                            </span>
                          </td>
                          <td className="py-4 px-3 font-medium text-slate-700">
                            {fac.courses}
                          </td>
                          <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-700">
                            {fac.responses}
                          </td>
                          <td className="py-4 px-3 text-right tabular-nums text-slate-600">
                            {fac.sectionA.toFixed(2)}
                          </td>
                          <td className="py-4 px-3 text-right tabular-nums text-slate-600">
                            {fac.sectionB.toFixed(2)}
                          </td>
                          <td className="py-4 px-3 text-right tabular-nums text-slate-600">
                            {fac.sectionC.toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center justify-center rounded-md bg-[#0B2545] px-2.5 py-1 text-xs font-extrabold text-white tabular-nums">
                              {fac.rating.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFacultyDetail(fac);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-[#0B2545] hover:border-[#0B2545] hover:bg-slate-50 transition-colors whitespace-nowrap"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Inspect Report</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 4: QUALITATIVE FEEDBACK & STUDENT REMARKS
        =================================================================== */}
        {activeTab === 'sentiment' && (
          <div className="flex flex-col gap-6">
            {/* Category Filter Pills */}
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block mb-1">
                  Qualitative Evaluation Summary
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Anonymized Student Remarks by Rubric Domain
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter feedback by rubric category">
                {['ALL', 'Management', 'Pedagogy', 'Transparency', 'Commitment'].map((cat) => {
                  const isSelected = feedbackCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFeedbackCategory(cat)}
                      className={`h-9 px-3.5 rounded-lg text-xs font-bold transition-colors ${
                        isSelected
                          ? 'bg-[#0B2545] text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Domains (4)' : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Theme Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFeedbackThemes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white p-5 sm:p-6 border border-slate-200 shadow-card flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1">
                          {item.category} &bull; {item.sectionRef}
                        </span>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                          {item.theme}
                        </h4>
                      </div>
                      <span className="rounded-md bg-[#0B2545] px-2.5 py-1 text-xs font-extrabold text-white tabular-nums shrink-0">
                        {item.mentions} Mentions
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {item.summary}
                    </p>

                    <div className="space-y-2.5 border-t border-slate-200 pt-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        Verified Student Remarks (Anonymized)
                      </span>
                      {item.remarks.map((rem) => (
                        <div
                          key={rem.id}
                          className="rounded-lg bg-slate-50 p-3.5 border border-slate-200 text-xs sm:text-sm text-slate-700"
                        >
                          <p className="leading-relaxed mb-1.5">
                            &ldquo;{rem.text}&rdquo;
                          </p>
                          <div className="text-[11px] font-bold text-[#0B2545]">
                            {rem.dept} &bull; Course: {rem.course}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 1: INDIVIDUAL FACULTY EVALUATION INSPECTOR
        =================================================================== */}
        {selectedFacultyDetail && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="faculty-detail-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-slate-200">
                <div>
                  <span className="inline-block rounded bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#0B2545] border border-slate-200 mb-1.5">
                    {selectedFacultyDetail.dept} &bull; {selectedFacultyDetail.deptName}
                  </span>
                  <h3 id="faculty-detail-title" className="text-xl font-extrabold text-slate-900">
                    {selectedFacultyDetail.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Assigned Courses: <strong className="font-bold text-slate-900">{selectedFacultyDetail.courses}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFacultyDetail(null)}
                  className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Close instructor report"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl bg-[#0B2545] p-4 text-white">
                  <span className="text-xs font-semibold text-slate-300 block">Composite Rating</span>
                  <span className="text-2xl font-extrabold tabular-nums mt-0.5 block">
                    {selectedFacultyDetail.rating.toFixed(2)} / 5.00
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 block">Student Responses</span>
                  <span className="text-2xl font-extrabold text-slate-900 tabular-nums mt-0.5 block">
                    {selectedFacultyDetail.responses}
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 block">Rating Classification</span>
                  <span className="text-sm font-extrabold text-[#0B2545] mt-1.5 block">
                    {selectedFacultyDetail.status}
                  </span>
                </div>
              </div>

              {/* Domain Breakdown */}
              <div className="space-y-3 mb-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Section Rubric Breakdown
                </h4>
                {[
                  { label: 'Section A: Management of Teaching and Learning', score: selectedFacultyDetail.sectionA },
                  { label: 'Section B: Content, Knowledge, Pedagogy & Technology', score: selectedFacultyDetail.sectionB },
                  { label: 'Section C: Commitment and Transparency', score: selectedFacultyDetail.sectionC },
                ].map((sec) => (
                  <div key={sec.label} className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                      <span>{sec.label}</span>
                      <span className="tabular-nums text-[#0B2545]">{sec.score.toFixed(2)} / 5.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#0B2545] rounded-full"
                        style={{ width: `${(sec.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample Anonymized Student Remark */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block mb-1">
                  Representative Student Remark (Anonymized)
                </span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  &ldquo;{selectedFacultyDetail.sampleRemark}&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedFacultyDetail(null)}
                  className="h-11 px-5 rounded-lg bg-[#0B2545] text-sm font-bold text-white hover:bg-[#133C6E] transition-colors"
                >
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 2: EXPORT CONSOLIDATED AUDIT REPORT (Real CSV Download)
        =================================================================== */}
        {showExportModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white">
                    <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="report-modal-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                      Consolidated Faculty Evaluation Audit Report
                    </h3>
                    <p className="text-xs font-medium text-slate-500">
                      NEMSU &ndash; Cantilan Campus &bull; [PLACEHOLDER: AY / Semester]
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Close export dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {exportSuccessMessage && (
                <div className="mb-4 rounded-xl bg-slate-100 border border-[#0B2545] p-3.5 text-xs sm:text-sm font-bold text-[#0B2545] flex items-center gap-2.5">
                  <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{exportSuccessMessage}</span>
                </div>
              )}

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 mb-6">
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Total Evaluations</span>
                    <span className="font-extrabold text-slate-900 text-lg tabular-nums">842</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Campus Turnout</span>
                    <span className="font-extrabold text-[#0B2545] text-lg tabular-nums">85.9%</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Institutional Mean</span>
                    <span className="font-extrabold text-[#0B2545] text-lg tabular-nums">4.64 / 5.00</span>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-56 border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase font-bold">
                      <tr>
                        <th className="p-3">Academic Department</th>
                        <th className="p-3 text-right">Faculty</th>
                        <th className="p-3 text-right">Responses</th>
                        <th className="p-3 text-right">Turnout</th>
                        <th className="p-3 text-right">Mean Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {DEPARTMENT_METRICS.map((d) => (
                        <tr key={d.code} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{d.name}</td>
                          <td className="p-3 text-right tabular-nums">{d.facultyCount}</td>
                          <td className="p-3 text-right tabular-nums">{d.totalResponses}</td>
                          <td className="p-3 text-right tabular-nums">{d.completion}%</td>
                          <td className="p-3 text-right font-extrabold text-[#0B2545] tabular-nums">
                            {d.avgRating.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Prepared for official review by the Academic Deans and Human Resource Management Office of North Eastern Mindanao State University &ndash; Cantilan Campus.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="h-11 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-11 px-4 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-bold text-[#0B2545] hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  <span>Print Summary</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="h-11 px-5 rounded-lg bg-[#0B2545] hover:bg-[#133C6E] text-xs sm:text-sm font-bold text-white transition-colors inline-flex items-center gap-2"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Download Full Roster CSV</span>
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
