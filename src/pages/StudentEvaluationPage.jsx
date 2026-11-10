import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Home,
  Check,
  Info,
  Printer,
  RefreshCw,
  Building2,
  Lock,
} from 'lucide-react';
import UniversitySeal from '../components/UniversitySeal';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  initiateStudentSession,
  fetchActiveAcademicPeriod,
  fetchDepartments,
  fetchFacultyByDepartment,
  fetchEvaluationRubric,
  submitStudentEvaluation,
} from '../services/api';
import {
  RATING_SCALE as FALLBACK_RATING_SCALE,
  EVALUATION_SECTIONS as FALLBACK_SECTIONS,
} from '../data/evaluationData';

/**
 * Student Evaluation of Teachers (SET) Module.
 * Fully wired to the Laravel RESTful API backend:
 * - Dynamic Academic Period status and label
 * - Real-time Department & Faculty roster
 * - Dynamic Evaluation Rubric instrument (Sections & Criteria)
 * - Institutional Student Session Verification & Sanctum Authorization
 * - Single-entry verification via RA 10173 anonymous hashed ledger
 */

export default function StudentEvaluationPage() {
  const { user } = useAuth();

  // API Config State
  const [activePeriod, setActivePeriod] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [rubric, setRubric] = useState({
    rating_scale: FALLBACK_RATING_SCALE,
    sections: FALLBACK_SECTIONS,
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);

  // Wizard state: 0 is email/privacy, 1 is dept/faculty/course, 2 is rating scale,
  // 3..(3 + sections.length - 1) are rating sections, (3 + sections.length) is qualitative,
  // (4 + sections.length) is confirmation receipt.
  const [step, setStep] = useState(0);

  // Form Fields
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [departmentId, setDepartmentId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [course, setCourse] = useState('');
  const [ratings, setRatings] = useState({}); // { [criterion_id]: score }
  const [comment, setComment] = useState('');

  // Async States & Error Handling
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedSummary, setSubmittedSummary] = useState(null);

  // Scroll to top when changing steps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Autofill student email if authenticated user is already logged in
  useEffect(() => {
    if (user?.email && user?.role === 'student' && !email) {
      setEmail(user.email);
    }
  }, [user]);

  // Load Initial API Data: Active Period, Departments, and Evaluation Rubric
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        setIsLoadingConfig(true);
        const [periodRes, deptsRes, rubricRes] = await Promise.all([
          fetchActiveAcademicPeriod().catch(() => null),
          fetchDepartments().catch(() => null),
          fetchEvaluationRubric().catch(() => null),
        ]);

        if (!isMounted) return;

        if (periodRes?.data) {
          setActivePeriod(periodRes.data);
        }

        if (deptsRes?.data && deptsRes.data.length > 0) {
          setDepartments(deptsRes.data);
        }

        if (rubricRes?.data) {
          setRubric({
            rating_scale: rubricRes.data.rating_scale || FALLBACK_RATING_SCALE,
            sections: rubricRes.data.sections || FALLBACK_SECTIONS,
          });
        }
      } catch (err) {
        console.error('Failed to load student evaluation configuration:', err);
      } finally {
        if (isMounted) setIsLoadingConfig(false);
      }
    }

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch faculty whenever the selected department changes
  useEffect(() => {
    if (!departmentId) {
      setFacultyList([]);
      setFacultyId('');
      return;
    }

    let isMounted = true;
    async function loadDepartmentFaculty() {
      try {
        setIsLoadingFaculty(true);
        setFacultyId('');
        const res = await fetchFacultyByDepartment(departmentId);
        if (!isMounted) return;
        if (res?.data) {
          setFacultyList(res.data);
        }
      } catch (err) {
        console.error('Failed to load department faculty:', err);
      } finally {
        if (isMounted) setIsLoadingFaculty(false);
      }
    }

    loadDepartmentFaculty();
    return () => {
      isMounted = false;
    };
  }, [departmentId]);

  // Derived Dynamic Structures
  const sections = rubric?.sections || [];
  const ratingScale = rubric?.rating_scale || [];

  const selectedDeptObj = useMemo(() => {
    return departments.find((d) => String(d.id) === String(departmentId)) || null;
  }, [departments, departmentId]);

  const selectedFacultyObj = useMemo(() => {
    return facultyList.find((f) => String(f.id) === String(facultyId)) || null;
  }, [facultyList, facultyId]);

  // Step Calculation
  const isRatingStep = step >= 3 && step < 3 + sections.length;
  const currentSectionIndex = isRatingStep ? step - 3 : null;
  const currentSection = currentSectionIndex !== null ? sections[currentSectionIndex] : null;

  const qualitativeStepIndex = 3 + sections.length;
  const confirmationStepIndex = 4 + sections.length;
  const totalInputSteps = qualitativeStepIndex + 1;

  // Step Titles
  const stepTitles = useMemo(() => {
    const titles = [
      'Email & Data Privacy',
      'Faculty & Course Selection',
      'Rating Scale Orientation',
    ];
    sections.forEach((sec) => {
      titles.push(`Section ${sec.code}: ${sec.title}`);
    });
    titles.push('Comments & Suggestions');
    return titles;
  }, [sections]);

  // Answered counter for current section
  const countAnswered = (section) => {
    if (!section || !section.items) return 0;
    return section.items.filter((item) => ratings[item.id] !== undefined).length;
  };

  const answeredInCurrentSection = currentSection ? countAnswered(currentSection) : 0;
  const totalInCurrentSection = currentSection?.items?.length || 0;

  // Validation Logic per step
  const validateCurrentStep = () => {
    setError('');

    // Step 0: Email & Privacy Agreement
    if (step === 0) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail || !emailPattern.test(cleanEmail)) {
        setError('Please enter a valid student email address.');
        return false;
      }
      if (!cleanEmail.endsWith('@nemsu.edu.ph')) {
        setError('Access restricted. Please use your official NEMSU institutional email (@nemsu.edu.ph).');
        return false;
      }
      if (!agree) {
        setError('You must acknowledge the Data Privacy Notice to proceed.');
        return false;
      }
      return true;
    }

    // Step 1: Department, Faculty, and Course Code
    if (step === 1) {
      if (!departmentId) {
        setError('Please select an academic department.');
        return false;
      }
      if (!facultyId) {
        setError('Please select the faculty member being evaluated.');
        return false;
      }
      if (!course.trim()) {
        setError('Please enter the course/subject code (e.g. IT 211, CS 101, PA 101, GE 101).');
        return false;
      }
      return true;
    }

    // Step 2: Rating Scale Orientation
    if (step === 2) {
      return true;
    }

    // Rating Steps (Section A, B, C...)
    if (isRatingStep && currentSection) {
      if (answeredInCurrentSection < totalInCurrentSection) {
        const remaining = totalInCurrentSection - answeredInCurrentSection;
        setError(
          `Please rate every statement in this section (${answeredInCurrentSection} of ${totalInCurrentSection} answered, ${remaining} remaining).`
        );
        return false;
      }
      return true;
    }

    // Qualitative Comments Step
    if (step === qualitativeStepIndex) {
      return true;
    }

    return true;
  };

  // Next / Continue button handler
  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // Step 0: Verify student institutional session with backend API
    if (step === 0) {
      try {
        setIsVerifyingSession(true);
        setError('');
        await initiateStudentSession(email.trim().toLowerCase());
        setStep(1);
      } catch (err) {
        setError(err.message || 'Unable to verify student institutional account. Please check your email.');
      } finally {
        setIsVerifyingSession(false);
      }
      return;
    }

    // Final Submit Step: Qualitative Comments
    if (step === qualitativeStepIndex) {
      try {
        setIsSubmitting(true);
        setError('');

        const payload = {
          academic_period_id: activePeriod?.id || 1,
          department_id: Number(departmentId),
          faculty_id: Number(facultyId),
          course_code: course.trim().toUpperCase(),
          ratings: ratings,
          qualitative_comment: comment.trim() || null,
        };

        const res = await submitStudentEvaluation(payload);

        if (res?.data) {
          setSubmittedSummary({
            confirmationCode: res.data.confirmation_code || `FEAS-${Date.now().toString(36).toUpperCase()}`,
            faculty: res.data.faculty || selectedFacultyObj?.name || 'Assigned Instructor',
            course: res.data.course_code || course.trim().toUpperCase(),
            department: res.data.department || selectedDeptObj?.name || 'Academic Unit',
            departmentCode: res.data.department_code || selectedDeptObj?.code || 'NEMSU',
            academicPeriod: res.data.academic_period || activePeriod?.label || 'A.Y. 2024-2025, 1st Semester',
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          });
          setStep(confirmationStepIndex);
        }
      } catch (err) {
        setError(
          err.message ||
            'Failed to submit evaluation. If you have already evaluated this instructor for this course, duplicate entries are prevented.'
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Normal Step Transition
    setStep((prev) => prev + 1);
  };

  // Back button handler
  const handleBack = () => {
    setError('');
    if (step > 0 && step < confirmationStepIndex) {
      setStep((prev) => prev - 1);
    }
  };

  // Rating selection handler
  const handleRatingChange = (itemId, score) => {
    setRatings((prev) => ({
      ...prev,
      [itemId]: score,
    }));
    if (error) setError('');
  };

  // Evaluate another instructor under the same student session
  const handleEvaluateAnother = () => {
    setFacultyId('');
    setCourse('');
    setRatings({});
    setComment('');
    setError('');
    setSubmittedSummary(null);
    setStep(1); // Jump straight to department & faculty selection
  };

  const progressPercentage = Math.min(100, Math.round(((step + 1) / totalInputSteps) * 100));

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* INSTITUTIONAL HEADER BAR — Strict Navy Blue & White */}
      <header className="bg-[#0B2545] text-white border-b border-white/15 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-3.5 group rounded-lg p-1 -m-1 focus-visible:outline-2 focus-visible:outline-white"
            title="Return to NEMSU-FEAS Portal Selection"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 border border-white/20">
              <UniversitySeal className="h-full w-full" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block leading-none mb-1">
                NEMSU &bull; Cantilan Campus
              </span>
              <span className="font-extrabold tracking-tight text-sm sm:text-base text-white block leading-none">
                Student Evaluation of Teachers
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Exit Portal</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-5">
        {/* LOADING CONFIGURATION SKELETON */}
        {isLoadingConfig ? (
          <div className="rounded-xl bg-white p-12 border border-slate-200 shadow-card text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-8 w-8 text-[#0B2545] animate-spin" />
            <h3 className="text-base font-extrabold text-slate-900">Loading Evaluation Instrument</h3>
            <p className="text-xs text-slate-500">
              Retrieving active academic period, academic departments, and official Likert rubric...
            </p>
          </div>
        ) : (
          <>
            {/* UNIFIED EVALUATION HEADER & PROGRESS CARD (Input Steps 0..totalInputSteps-1) */}
            {step < confirmationStepIndex && (
              <div
                className="rounded-xl bg-white p-5 sm:p-6 border border-slate-200 shadow-card"
                role="region"
                aria-label="Evaluation Progress and Context"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1">
                      Step {step + 1} of {totalInputSteps} &bull; {stepTitles[step] || 'Evaluation Step'}
                    </span>
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      Student Evaluation of Teachers (SET)
                    </h1>
                  </div>

                  {/* Active Academic Term Badge */}
                  {activePeriod && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-[#0B2545] border border-slate-200">
                        {activePeriod.label || `A.Y. ${activePeriod.academic_year}`}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                          activePeriod.status === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {activePeriod.status === 'open' ? 'Portal Open' : 'Closed'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                    <span>Completion Progress</span>
                    <span className="tabular-nums text-[#0B2545] font-bold">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div
                    className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={progressPercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full bg-[#0B2545] transition-all duration-200 ease-out rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Active Context Banner (Steps 2..End of input once Faculty & Course are chosen) */}
                {step >= 2 && selectedFacultyObj && (
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-slate-500 font-medium">Evaluating:</span>
                      <span className="font-bold text-[#0B2545]">{selectedFacultyObj.name}</span>
                      {selectedDeptObj && (
                        <span className="text-slate-400 font-medium">
                          ({selectedDeptObj.code})
                        </span>
                      )}
                      {course && (
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 border border-slate-200">
                          {course.trim().toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-[#0B2545] underline underline-offset-2 hover:text-[#133C6E]"
                    >
                      Change Instructor
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ERROR ALERT BANNER */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-start gap-3 shadow-subtle"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                <div className="font-semibold leading-relaxed">{error}</div>
              </div>
            )}

            {/* STEP 0: EMAIL & DATA PRIVACY NOTICE */}
            {step === 0 && (
              <div className="rounded-xl bg-white p-5 sm:p-7 border border-slate-200 shadow-card flex flex-col gap-6">
                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-sm font-bold text-slate-900 mb-1"
                  >
                    Institutional Student Email Address <span className="text-rose-600">*</span>
                  </label>
                  <p className="text-xs sm:text-sm text-slate-600 mb-2.5 leading-relaxed">
                    Used strictly to verify single-entry eligibility. In compliance with RA 10173, your email is permanently detached from the ratings and comments submitted.
                  </p>
                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    required
                    spellCheck={false}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. maria.student@nemsu.edu.ph"
                    className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base text-slate-900 placeholder-slate-400 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Must end with <strong className="text-slate-800">@nemsu.edu.ph</strong>
                  </span>
                </div>

                {/* Official Data Privacy Notice Box (RA 10173) */}
                <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 text-slate-700">
                  <div className="flex items-center gap-2.5 mb-3 text-[#0B2545]">
                    <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                      Data Privacy Notice (Republic Act No. 10173)
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm space-y-2.5 leading-relaxed text-slate-600">
                    <p>
                      North Eastern Mindanao State University (NEMSU) &ndash; Cantilan Campus is committed to protecting your personal data and privacy in accordance with the Philippine Data Privacy Act of 2012 (RA 10173).
                    </p>
                    <p>
                      <strong className="font-bold text-slate-900">Confidentiality Guarantee:</strong> All responses submitted through NEMSU-FEAS are strictly confidential. Individual ratings and feedback are aggregated into institutional statistical summaries. No instructor or dean can trace ratings back to any specific student.
                    </p>
                    <p>
                      <strong className="font-bold text-slate-900">Purpose of Collection:</strong> Information gathered is used solely for the assessment of instructional competencies and faculty development.
                    </p>
                  </div>
                </div>

                {/* Checkbox Agreement */}
                <label
                  className={`flex items-start gap-3.5 cursor-pointer select-none rounded-xl p-4 transition-colors border ${
                    agree
                      ? 'border-[#0B2545] bg-slate-50/80'
                      : 'border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    name="privacyAgreement"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      if (error) setError('');
                    }}
                    className="h-5 w-5 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545] mt-0.5 accent-[#0B2545] cursor-pointer shrink-0"
                  />
                  <span className="text-sm font-medium text-slate-800 leading-relaxed">
                    I have read and understood the Data Privacy Notice and agree to proceed with this faculty evaluation. <span className="text-rose-600">*</span>
                  </span>
                </label>
              </div>
            )}

            {/* STEP 1: DEPARTMENT, FACULTY, AND COURSE CODE */}
            {step === 1 && (
              <div className="rounded-xl bg-white p-5 sm:p-7 border border-slate-200 shadow-card flex flex-col gap-6">
                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">
                    Academic Department <span className="text-rose-600">*</span>
                  </label>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">
                    Select the academic department of the instructor you are evaluating.
                  </p>

                  <div className="grid grid-cols-1 gap-2.5" role="radiogroup" aria-label="Academic Department">
                    {departments.map((dept) => {
                      const isChecked = String(departmentId) === String(dept.id);
                      return (
                        <label
                          key={dept.id}
                          className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-colors ${
                            isChecked
                              ? 'border-2 border-[#0B2545] bg-slate-50 text-slate-900 font-bold shadow-subtle'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium'
                          }`}
                        >
                          <input
                            type="radio"
                            name="department"
                            checked={isChecked}
                            onChange={() => {
                              setDepartmentId(dept.id);
                              if (error) setError('');
                            }}
                            className="h-4 w-4 accent-[#0B2545] cursor-pointer shrink-0"
                          />
                          <div className="flex items-center justify-between w-full">
                            <span className="text-sm sm:text-base">{dept.name}</span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {dept.code}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Faculty Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="faculty-select"
                      className="block text-sm font-bold text-slate-900"
                    >
                      Faculty Member <span className="text-rose-600">*</span>
                    </label>
                    {isLoadingFaculty && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#0B2545] font-semibold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Loading roster...</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-2.5">
                    Choose your instructor from the selected department roster.
                  </p>
                  <select
                    id="faculty-select"
                    name="faculty"
                    value={facultyId}
                    onChange={(e) => {
                      setFacultyId(e.target.value);
                      if (error) setError('');
                    }}
                    disabled={!departmentId || isLoadingFaculty}
                    className="w-full h-12 rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-900 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!departmentId
                        ? 'Select an academic department above first...'
                        : facultyList.length === 0 && !isLoadingFaculty
                        ? 'No active faculty found for this department'
                        : 'Select a faculty member...'}
                    </option>
                    {facultyList.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} {fac.courses ? `(${fac.courses})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Code */}
                <div>
                  <label
                    htmlFor="course-code"
                    className="block text-sm font-bold text-slate-900 mb-1"
                  >
                    Course / Subject Code <span className="text-rose-600">*</span>
                  </label>
                  <p className="text-xs sm:text-sm text-slate-600 mb-2.5">
                    Enter the official course code for this class (e.g. IT 211, CS 101, PA 101, GE 101).
                  </p>
                  <input
                    id="course-code"
                    name="courseCode"
                    type="text"
                    required
                    spellCheck={false}
                    value={course}
                    onChange={(e) => {
                      setCourse(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="e.g. IT 211"
                    className="w-full h-12 rounded-lg border border-slate-300 bg-white px-4 text-base font-semibold text-slate-900 placeholder-slate-400 placeholder:font-normal focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors uppercase"
                  />
                  {selectedFacultyObj?.courses && (
                    <span className="text-xs text-slate-500 mt-1 block">
                      Common courses for this instructor: <span className="font-semibold text-slate-700">{selectedFacultyObj.courses}</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: RATING SCALE ORIENTATION GUIDE */}
            {step === 2 && (
              <div className="rounded-xl bg-white p-5 sm:p-7 border border-slate-200 shadow-card flex flex-col gap-6">
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1">
                    Standardized 5-Point Likert Scale
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Rating Scale Guide
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Review the official institutional rating definitions below before scoring. This 5-point scale is also summarized at the top of each section for quick reference.
                  </p>
                </div>

                {/* Rating Scale Table */}
                <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 overflow-hidden">
                  {ratingScale.map((s) => (
                    <div
                      key={s.score}
                      className="flex items-start sm:items-center gap-4 p-4 bg-white"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] font-extrabold text-base text-white tabular-nums"
                        aria-hidden="true"
                      >
                        {s.score}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {s.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-xs sm:text-sm text-slate-700 flex items-start gap-3 border border-slate-200">
                  <Info className="h-5 w-5 text-[#0B2545] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed">
                    Please evaluate objectively based on your direct classroom experience and learning engagement throughout the semester.
                  </span>
                </div>
              </div>
            )}

            {/* STEPS 3..RATING SECTIONS (Dynamic sections from backend rubric) */}
            {isRatingStep && currentSection && (
              <div className="rounded-xl bg-white p-5 sm:p-7 border border-slate-200 shadow-card flex flex-col gap-6">
                {/* Section Header */}
                <div className="border-b border-slate-200 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545]">
                      Section {currentSection.code} of {sections.length}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border tabular-nums ${
                        answeredInCurrentSection === totalInCurrentSection
                          ? 'bg-[#0B2545] text-white border-[#0B2545]'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {answeredInCurrentSection} of {totalInCurrentSection} Answered
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    {currentSection.title} <span className="text-rose-600">*</span>
                  </h2>
                  {currentSection.description && (
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      {currentSection.description}
                    </p>
                  )}

                  {/* Compact Scale Legend */}
                  <div className="mt-4 rounded-lg bg-slate-50 p-3 border border-slate-200">
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      {ratingScale.map((scaleItem) => (
                        <div key={scaleItem.score}>
                          <span className="font-extrabold text-[#0B2545] block">{scaleItem.score}</span>
                          <span className="text-[11px] font-medium text-slate-600 truncate block">
                            {scaleItem.label.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Criteria Questions List */}
                <div className="space-y-4">
                  {currentSection.items?.map((item, index) => {
                    const currentScore = ratings[item.id];
                    const isItemAnswered = currentScore !== undefined;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-4 sm:p-5 transition-colors ${
                          isItemAnswered
                            ? 'border-[#0B2545]/30 bg-white shadow-subtle'
                            : 'border-slate-200 bg-slate-50/60'
                        }`}
                      >
                        {/* Item Statement & Order */}
                        <div className="flex items-start gap-3.5 mb-4">
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold mt-0.5 tabular-nums border ${
                              isItemAnswered
                                ? 'bg-[#0B2545] text-white border-[#0B2545]'
                                : 'bg-white text-slate-700 border-slate-300'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <p className="text-sm sm:text-base text-slate-900 font-semibold leading-relaxed flex-1">
                            {item.text || item.criterion_text}
                          </p>
                          {isItemAnswered && (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 text-[#0B2545] shrink-0 mt-0.5">
                              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                            </span>
                          )}
                        </div>

                        {/* Rating Segmented Control (5 to 1) */}
                        <div
                          className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-200/80"
                          role="radiogroup"
                          aria-label={`Rating for statement: ${item.text || item.criterion_text}`}
                        >
                          {[5, 4, 3, 2, 1].map((num) => {
                            const isSelected = currentScore === num;
                            const matchedScale = ratingScale.find((s) => s.score === num);
                            const labelText = matchedScale ? matchedScale.label.split(' ')[0] : `${num}`;

                            return (
                              <label
                                key={num}
                                className={`flex flex-col items-center justify-center min-h-[52px] py-2.5 px-1.5 rounded-lg cursor-pointer border text-center select-none transition-all duration-150 ${
                                  isSelected
                                    ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-subtle ring-2 ring-[#0B2545]/20'
                                    : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-[#0B2545]/50 active:bg-slate-100'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`item-${item.id}`}
                                  value={num}
                                  checked={isSelected}
                                  onChange={() => handleRatingChange(item.id, num)}
                                  className="sr-only"
                                  aria-label={`Rate ${num} (${labelText})`}
                                />
                                <span className="text-base sm:text-lg font-extrabold leading-none tabular-nums">
                                  {num}
                                </span>
                                <span
                                  className={`hidden sm:block text-[11px] font-semibold mt-1 ${
                                    isSelected ? 'text-slate-200' : 'text-slate-500'
                                  }`}
                                >
                                  {labelText}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FINAL INPUT STEP: COMMENTS & SUGGESTIONS */}
            {step === qualitativeStepIndex && (
              <div className="rounded-xl bg-white p-5 sm:p-7 border border-slate-200 shadow-card flex flex-col gap-6">
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1">
                    Final Step &bull; Qualitative Feedback
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    Comments and Suggestions
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Share constructive remarks, commendations, or areas for improvement regarding course delivery for{' '}
                    <strong className="font-bold text-slate-900">{selectedFacultyObj?.name}</strong> ({course.trim().toUpperCase()}).
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 text-xs sm:text-sm text-slate-600 border border-slate-200 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-1">
                    Confidentiality &amp; Feedback Usage
                  </p>
                  <p>
                    Written feedback is compiled anonymously in departmental analytics reports to help instructors and academic deans identify instructional strengths and improvement opportunities.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="qualitative-comment"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Written Remarks <span className="font-normal text-slate-500">(Optional)</span>
                  </label>
                  <textarea
                    id="qualitative-comment"
                    name="qualitativeComment"
                    rows={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Provide specific observations regarding teaching clarity, class pacing, assessments, or helpful learning activities..."
                    className="w-full rounded-lg border border-slate-300 bg-white p-4 text-base text-slate-900 placeholder-slate-400 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors leading-relaxed"
                  />
                  <span className="block text-right text-xs font-medium text-slate-500 mt-1.5 tabular-nums">
                    {comment.length} characters
                  </span>
                </div>
              </div>
            )}

            {/* CONFIRMATION STEP: SUBMISSION RECEIPT */}
            {step === confirmationStepIndex && (
              <div className="rounded-xl bg-white p-6 sm:p-10 border border-slate-200 shadow-card text-center flex flex-col items-center">
                {/* Check Badge */}
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2545] text-white mb-4 shadow-subtle">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </div>

                <span className="inline-block rounded-md bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0B2545] border border-slate-200 mb-2">
                  Evaluation Submitted &amp; Verified
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                  Thank You for Your Feedback
                </h2>

                <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed mb-6">
                  Your evaluation has been recorded anonymously for North Eastern Mindanao State University &ndash; Cantilan Campus.
                </p>

                {/* Submission Receipt Card */}
                {submittedSummary && (
                  <div className="w-full max-w-lg rounded-xl bg-slate-50 p-5 sm:p-6 border border-slate-200 text-left mb-6 text-xs sm:text-sm text-slate-600 space-y-3">
                    <div className="flex justify-between items-center gap-4 border-b border-slate-200 pb-3">
                      <span className="font-semibold text-slate-600">Confirmation Code</span>
                      <span className="font-mono font-black text-sm text-[#0B2545] bg-white px-2.5 py-1 rounded border border-slate-200">
                        {submittedSummary.confirmationCode}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2.5">
                      <span className="font-semibold text-slate-600">Faculty Evaluated</span>
                      <span className="font-bold text-[#0B2545] text-right">{submittedSummary.faculty}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2.5">
                      <span className="font-semibold text-slate-600">Course Code</span>
                      <span className="font-bold text-slate-900">{submittedSummary.course}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2.5">
                      <span className="font-semibold text-slate-600">Academic Department</span>
                      <span className="font-medium text-right text-slate-800">
                        {submittedSummary.department} ({submittedSummary.departmentCode})
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200 pb-2.5">
                      <span className="font-semibold text-slate-600">Academic Period</span>
                      <span className="font-medium text-right text-slate-800">{submittedSummary.academicPeriod}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold text-slate-600">Date Recorded</span>
                      <span className="font-medium text-slate-800 tabular-nums">{submittedSummary.date}</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 text-[11px] text-slate-500 max-w-lg mb-6 leading-relaxed flex items-center gap-2 text-left">
                  <Lock className="h-4 w-4 shrink-0 text-[#0B2545]" />
                  <span>
                    In accordance with the Data Privacy Act of 2012 (RA 10173), a one-way cryptographic hash of your student ID was logged in the anti-duplicate verification ledger without storing any link to your scores.
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
                  <button
                    type="button"
                    onClick={handleEvaluateAnother}
                    className="w-full sm:flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B2545] px-5 text-sm font-bold text-white whitespace-nowrap shadow-subtle hover:bg-[#133C6E] active:bg-[#040F21] transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Evaluate Another Instructor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-300 px-4 text-sm font-bold text-[#0B2545] whitespace-nowrap hover:bg-slate-50 transition-colors"
                    title="Print Submission Confirmation"
                  >
                    <Printer className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Print</span>
                  </button>

                  <Link
                    to="/"
                    className="w-full sm:flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-300 px-5 text-sm font-bold text-slate-700 whitespace-nowrap hover:bg-slate-50 transition-colors"
                  >
                    <Home className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    <span>Return Home</span>
                  </Link>
                </div>
              </div>
            )}

            {/* BOTTOM NAVIGATION BUTTONS (Steps 0..totalInputSteps-1) */}
            {step < confirmationStepIndex && (
              <div className="flex items-center justify-between gap-4 pt-2">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-12 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 shadow-subtle hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isVerifyingSession || isSubmitting}
                  className="h-12 inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#0B2545] px-6 text-sm font-bold text-white shadow-subtle hover:bg-[#133C6E] active:bg-[#040F21] transition-colors ml-auto disabled:opacity-60"
                >
                  {(isVerifyingSession || isSubmitting) && (
                    <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                  )}
                  <span>
                    {isVerifyingSession
                      ? 'Verifying Student Account...'
                      : isSubmitting
                      ? 'Submitting Evaluation...'
                      : step === qualitativeStepIndex
                      ? 'Submit Evaluation'
                      : 'Continue'}
                  </span>
                  {!isVerifyingSession && !isSubmitting && (
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* FOOTER */}
        <Footer />
      </main>
    </div>
  );
}
