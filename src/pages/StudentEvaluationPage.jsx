import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Check,
  Printer,
  RefreshCw,
  Lock,
  Star,
  ShieldCheck,
  Info,
} from 'lucide-react';
import Header from '../components/Header';
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
  DEPARTMENTS as FALLBACK_DEPARTMENTS,
  FALLBACK_FACULTY_BY_DEPT,
  RATING_SCALE as FALLBACK_RATING_SCALE,
  EVALUATION_SECTIONS as FALLBACK_SECTIONS,
  formatDepartmentName,
} from '../data/evaluationData';

const PREFERRED_ORDER = ['DBM', 'DCS', 'DIT', 'DGTT', 'CCJE'];

/**
 * Minimalist Student Evaluation of Teachers (SET) Module.
 * Wired to the Laravel RESTful API backend and aligned with the landing page design system.
 */
export default function StudentEvaluationPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const preselectedDeptCode =
    searchParams.get('dept') || location.state?.departmentCode || '';
  const preselectedDeptId = location.state?.departmentId || '';

  // API Config State
  const [activePeriod, setActivePeriod] = useState(null);
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);
  const departmentsRef = useRef(FALLBACK_DEPARTMENTS);
  const [facultyList, setFacultyList] = useState([]);
  const [rubric, setRubric] = useState({
    rating_scale: FALLBACK_RATING_SCALE,
    sections: FALLBACK_SECTIONS,
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);

  // Wizard step:
  // 0 = Teacher, Course & Data Privacy Notice (RA 10173)
  // 1 = Faculty Evaluation Rating Scale (5-Point Likert Scale Guide)
  // 2..(1 + sections.length) = Rating Sections (A, B, C...)
  // (2 + sections.length) = Qualitative Comments & Submit
  // (3 + sections.length) = Confirmation Receipt
  const [step, setStep] = useState(0);

  // Form Fields
  const initialDept = useMemo(() => {
    if (preselectedDeptId) return String(preselectedDeptId);
    if (preselectedDeptCode) {
      const found = FALLBACK_DEPARTMENTS.find(
        (d) => d.code.toUpperCase() === preselectedDeptCode.toUpperCase()
      );
      if (found) return String(found.id);
    }
    return String(FALLBACK_DEPARTMENTS[0].id);
  }, [preselectedDeptId, preselectedDeptCode]);

  const [departmentId, setDepartmentId] = useState(initialDept);
  const [facultyId, setFacultyId] = useState('');
  const [course, setCourse] = useState('');
  const [email, setEmail] = useState('');
  const [agree, setAgree] = useState(false);
  const [ratings, setRatings] = useState({});
  const [comment, setComment] = useState('');

  // Async States & Error Handling
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedSummary, setSubmittedSummary] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

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

        const rawDepts =
          deptsRes?.data && deptsRes.data.length > 0
            ? deptsRes.data
            : FALLBACK_DEPARTMENTS;

        const sortedDepts = [...rawDepts].sort((a, b) => {
          const idxA = PREFERRED_ORDER.indexOf(a.code);
          const idxB = PREFERRED_ORDER.indexOf(b.code);
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });

        departmentsRef.current = sortedDepts;
        setDepartments(sortedDepts);

        if (preselectedDeptCode) {
          const matched = sortedDepts.find(
            (d) => d.code?.toUpperCase() === preselectedDeptCode.toUpperCase()
          );
          if (matched) {
            setDepartmentId(String(matched.id));
          }
        } else if (!departmentId && sortedDepts.length > 0) {
          setDepartmentId(String(sortedDepts[0].id));
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
      const matchedDept = departmentsRef.current.find(
        (d) => String(d.id) === String(departmentId)
      );
      const deptCode = matchedDept?.code || preselectedDeptCode.toUpperCase() || 'DBM';

      try {
        setIsLoadingFaculty(true);
        setFacultyId('');
        const res = await fetchFacultyByDepartment(departmentId);
        if (!isMounted) return;
        if (res?.data && res.data.length > 0) {
          setFacultyList(res.data);
        } else {
          setFacultyList(FALLBACK_FACULTY_BY_DEPT[deptCode] || []);
        }
      } catch {
        if (isMounted) {
          setFacultyList(FALLBACK_FACULTY_BY_DEPT[deptCode] || []);
        }
      } finally {
        if (isMounted) setIsLoadingFaculty(false);
      }
    }

    loadDepartmentFaculty();
    return () => {
      isMounted = false;
    };
  }, [departmentId, preselectedDeptCode]);

  const sections = rubric?.sections || [];
  const ratingScale = useMemo(() => {
    const scale = rubric?.rating_scale || FALLBACK_RATING_SCALE;
    return [...scale].sort((a, b) => Number(b.score) - Number(a.score));
  }, [rubric]);

  const selectedDeptObj = useMemo(() => {
    return departments.find((d) => String(d.id) === String(departmentId)) || null;
  }, [departments, departmentId]);

  const selectedFacultyObj = useMemo(() => {
    return facultyList.find((f) => String(f.id) === String(facultyId)) || null;
  }, [facultyList, facultyId]);

  // Suggested course chips from selected faculty
  const suggestedCourses = useMemo(() => {
    if (!selectedFacultyObj?.courses) return [];
    return selectedFacultyObj.courses
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
  }, [selectedFacultyObj]);

  // Auto-fill first course when faculty is picked if course is empty
  useEffect(() => {
    if (suggestedCourses.length > 0 && !course) {
      setCourse(suggestedCourses[0]);
    }
  }, [suggestedCourses]);

  // Step Calculation
  const ratingScaleStepIndex = 1;
  const firstSectionStepIndex = 2;
  const isRatingStep =
    step >= firstSectionStepIndex &&
    step < firstSectionStepIndex + sections.length;
  const currentSectionIndex = isRatingStep ? step - firstSectionStepIndex : null;
  const currentSection =
    currentSectionIndex !== null ? sections[currentSectionIndex] : null;

  const qualitativeStepIndex = firstSectionStepIndex + sections.length;
  const confirmationStepIndex = qualitativeStepIndex + 1;
  const totalInputSteps = qualitativeStepIndex + 1;

  const countAnswered = (section) => {
    if (!section || !section.items) return 0;
    return section.items.filter((item) => ratings[item.id] !== undefined).length;
  };

  const answeredInCurrentSection = currentSection
    ? countAnswered(currentSection)
    : 0;
  const totalInCurrentSection = currentSection?.items?.length || 0;

  const validateCurrentStep = () => {
    setError('');

    if (step === 0) {
      if (!departmentId) {
        setError('Department information is missing. Please return to home and pick your department.');
        return false;
      }
      if (!facultyId) {
        setError('Please choose your teacher.');
        return false;
      }
      if (!course.trim()) {
        setError('Please enter or select the course code (e.g. IT 211, CS 101).');
        return false;
      }
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(cleanEmail) || !cleanEmail.endsWith('@nemsu.edu.ph')) {
          setError('If providing an email, please use your official @nemsu.edu.ph address, or leave it blank to stay anonymous.');
          return false;
        }
      }
      if (!agree) {
        setError('Please acknowledge the Data Privacy Notice (RA 10173) to proceed.');
        return false;
      }
      return true;
    }

    if (isRatingStep && currentSection) {
      if (answeredInCurrentSection < totalInCurrentSection) {
        const remaining = totalInCurrentSection - answeredInCurrentSection;
        setError(
          `Please rate all questions in this section (${remaining} remaining).`
        );
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    // Step 0: Initiate student session (anonymous or institutional email)
    if (step === 0) {
      try {
        setIsVerifyingSession(true);
        setError('');
        const cleanEmail = email.trim().toLowerCase() || null;
        await initiateStudentSession(cleanEmail);
        setStep(1);
      } catch (err) {
        setError(
          err.message ||
            'Unable to start evaluation session. Please verify your connection.'
        );
      } finally {
        setIsVerifyingSession(false);
      }
      return;
    }

    // Final Submit Step
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
            confirmationCode:
              res.data.confirmation_code ||
              `FEAS-${Date.now().toString(36).toUpperCase()}`,
            faculty:
              res.data.faculty ||
              selectedFacultyObj?.name ||
              'Assigned Instructor',
            course: res.data.course_code || course.trim().toUpperCase(),
            department:
              res.data.department ||
              selectedDeptObj?.name ||
              'Academic Unit',
            departmentCode:
              res.data.department_code || selectedDeptObj?.code || 'NEMSU',
            academicPeriod:
              res.data.academic_period ||
              activePeriod?.label ||
              'A.Y. 2024-2025, 1st Semester',
            date: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          });
          setStep(confirmationStepIndex);
        }
      } catch (err) {
        setError(
          err.message ||
            'Failed to submit evaluation. Duplicate entries for the same teacher and course are prevented.'
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    if (step > 0 && step < confirmationStepIndex) {
      setStep((prev) => prev - 1);
    }
  };

  const handleRatingChange = (itemId, score) => {
    setRatings((prev) => ({
      ...prev,
      [itemId]: score,
    }));
    if (error) setError('');
  };

  const handleEvaluateAnother = () => {
    setFacultyId('');
    setCourse('');
    setRatings({});
    setComment('');
    setError('');
    setSubmittedSummary(null);
    setStep(0);
  };

  const progressPercentage = Math.min(
    100,
    Math.round(((step + 1) / totalInputSteps) * 100)
  );

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0B2545] flex flex-col justify-between">
      {/* TOP BAR */}
      <Header
        maxWidthClass="max-w-3xl"
        rightContent={
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#0B2545] border border-slate-200 shadow-subtle hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
            <span>Back to home</span>
          </Link>
        }
      />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-10 py-8 sm:py-10 flex flex-col gap-5">
        {isLoadingConfig ? (
          <div className="rounded-[28px] bg-white p-12 border border-slate-200/70 shadow-command text-center flex flex-col items-center justify-center gap-3">
            <RefreshCw className="h-7 w-7 text-[#0B2545] animate-spin" />
            <h2 className="text-base font-extrabold text-[#0B2545]">
              Loading evaluation form...
            </h2>
          </div>
        ) : (
          <>
            {/* MINIMALIST PROGRESS BAR & CONTEXT PILL */}
            {step < confirmationStepIndex && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block rounded-full bg-[#FCEFC7] px-3 py-1 text-xs font-bold text-[#0B2545]">
                      {activePeriod?.label || 'Student Evaluation of Teachers'}
                    </span>
                    {selectedDeptObj && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF1FA] px-3 py-1 text-xs font-extrabold text-[#0B2545]">
                        {selectedDeptObj.code}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500 tabular-nums">
                    Step {step + 1} of {totalInputSteps} &middot; {progressPercentage}%
                  </span>
                </div>

                <div
                  className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={progressPercentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-[#0B2545] transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Active Teacher Context Pill on Orientation & Rating Steps */}
                {step >= 1 && selectedFacultyObj && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2.5 border border-slate-200/80 shadow-subtle text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-500 font-medium">Teacher:</span>
                      <span className="font-extrabold text-[#0B2545]">
                        {selectedFacultyObj.name}
                      </span>
                      {course && (
                        <span className="rounded-lg bg-[#EBF1FA] px-2 py-0.5 text-xs font-extrabold text-[#0B2545]">
                          {course.trim().toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="text-xs font-bold text-slate-500 hover:text-[#0B2545] underline underline-offset-2"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ERROR ALERT */}
            {error && (
              <div
                role="alert"
                aria-live="polite"
                className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 shadow-subtle"
              >
                <AlertCircle
                  className="h-4 w-4 shrink-0 mt-0.5 text-rose-600"
                  aria-hidden="true"
                />
                <div className="font-semibold leading-relaxed">{error}</div>
              </div>
            )}

            {/* STEP 0 (STEP 1): CHOOSE TEACHER, COURSE & DATA PRIVACY NOTICE */}
            {step === 0 && (
              <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-xs font-extrabold text-white mt-0.5">
                    1
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[#0B2545] leading-snug">
                      Choose your teacher and course
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Select the instructor and subject you are rating this semester.
                    </p>
                  </div>
                </div>

                {/* Teacher Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="faculty-select"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Teacher <span className="text-rose-600">*</span>
                    </label>
                    {isLoadingFaculty && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#0B2545] font-semibold">
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Loading teachers...</span>
                      </span>
                    )}
                  </div>

                  <select
                    id="faculty-select"
                    name="faculty"
                    value={facultyId}
                    onChange={(e) => {
                      setFacultyId(e.target.value);
                      setCourse('');
                      if (error) setError('');
                    }}
                    disabled={!departmentId || isLoadingFaculty}
                    className="w-full h-12 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 text-sm sm:text-base font-bold text-[#0B2545] focus:bg-white focus:border-[#0B2545] transition-colors disabled:opacity-50"
                  >
                    <option value="">
                      {facultyList.length === 0 && !isLoadingFaculty
                        ? 'No active teachers found in this department'
                        : 'Choose your teacher...'}
                    </option>
                    {facultyList.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} {fac.courses ? `\u2014 ${fac.courses}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Course Code Input + Quick Chips */}
                <div>
                  <label
                    htmlFor="course-code"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                  >
                    Course / Subject Code <span className="text-rose-600">*</span>
                  </label>
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
                    placeholder="e.g. IT 211, CS 101, GE 101"
                    className="w-full h-12 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 text-sm sm:text-base font-bold text-[#0B2545] placeholder-slate-400 placeholder:font-normal focus:bg-white focus:border-[#0B2545] transition-colors uppercase"
                  />

                  {suggestedCourses.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-xs text-slate-400 mr-1">
                        Assigned subjects:
                      </span>
                      {suggestedCourses.map((c) => {
                        const isPicked =
                          course.trim().toUpperCase() === c.toUpperCase();
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              setCourse(c);
                              if (error) setError('');
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                              isPicked
                                ? 'bg-[#0B2545] text-white'
                                : 'bg-[#EBF1FA] text-[#0B2545] hover:bg-slate-200'
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Optional Institutional Email */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="student-email"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Student Email <span className="font-normal lowercase">(optional)</span>
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                      <Lock className="h-3 w-3 text-[#0B2545]" />
                      <span>Detached from ratings</span>
                    </span>
                  </div>
                  <input
                    id="student-email"
                    name="email"
                    type="email"
                    spellCheck={false}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Leave blank for no-login anonymous session, or enter @nemsu.edu.ph"
                    className="w-full h-11 rounded-2xl border border-slate-200/90 bg-slate-50/50 px-4 text-sm text-[#0B2545] placeholder-slate-400 focus:bg-white focus:border-[#0B2545] transition-colors"
                  />
                </div>

                {/* Data Privacy Notice (Republic Act No. 10173) */}
                <div className="rounded-2xl bg-[#F8FAFC] p-5 border border-slate-200/80 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-[#0B2545]">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#EBF1FA] text-[#0B2545]">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                      Data Privacy Notice (Republic Act No. 10173)
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm space-y-2 leading-relaxed text-slate-600">
                    <p>
                      North Eastern Mindanao State University (NEMSU) &ndash; Cantilan Campus protects your personal data in accordance with the Philippine Data Privacy Act of 2012 (RA 10173).
                    </p>
                    <p>
                      <strong className="font-bold text-[#0B2545]">Confidentiality Guarantee:</strong>{' '}
                      All ratings and written feedback are strictly anonymous and aggregated into departmental summaries. No instructor or dean can trace responses back to any student.
                    </p>
                    <p>
                      <strong className="font-bold text-[#0B2545]">Purpose of Collection:</strong>{' '}
                      Information gathered is used solely for assessing instructional competencies and faculty development.
                    </p>
                  </div>
                </div>

                {/* Privacy Consent Checkbox */}
                <label
                  className={`flex items-start gap-3.5 cursor-pointer select-none rounded-2xl p-4 transition-colors border ${
                    agree
                      ? 'border-[#0B2545] bg-[#EBF1FA]/40'
                      : 'border-slate-200/90 bg-white hover:bg-slate-50/70'
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
                    className="h-4 w-4 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545] mt-0.5 accent-[#0B2545] cursor-pointer shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-[#0B2545] leading-relaxed">
                    I have read and understood the Data Privacy Notice and agree to proceed with this faculty evaluation. <span className="text-rose-600">*</span>
                  </span>
                </label>
              </div>
            )}

            {/* STEP 1 (STEP 2): FACULTY EVALUATION RATING SCALE */}
            {step === ratingScaleStepIndex && (
              <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command flex flex-col gap-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-xs font-extrabold text-white mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="inline-block rounded-full bg-[#FCEFC7] px-2.5 py-0.5 text-[11px] font-bold text-[#0B2545] mb-1.5">
                      Standardized 5-Point Likert Scale
                    </span>
                    <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[#0B2545] leading-snug">
                      Faculty Evaluation Rating Scale
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">
                      Review the official rating definitions below before scoring. This scale is also summarized at the top of each section.
                    </p>
                  </div>
                </div>

                {/* 5-Point Rating Scale Guide */}
                <div className="space-y-2.5">
                  {ratingScale.map((scaleItem) => (
                    <div
                      key={scaleItem.score}
                      className="flex items-start sm:items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-[#F8FAFC]/70 p-3.5 sm:p-4"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-white font-extrabold text-base tabular-nums gap-0.5"
                        aria-hidden="true"
                      >
                        <span>{scaleItem.score}</span>
                        <Star className="h-3 w-3 text-[#F5B800] fill-[#F5B800]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-[15px] font-extrabold text-[#0B2545]">
                          {scaleItem.label}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                          {scaleItem.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Objectivity Note */}
                <div className="rounded-2xl bg-[#EBF1FA]/60 p-4 text-xs sm:text-sm text-[#0B2545] flex items-start gap-3 border border-slate-200/70">
                  <Info className="h-4 w-4 text-[#0B2545] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed font-medium">
                    Please evaluate objectively based on your direct classroom experience and learning engagement throughout the semester.
                  </span>
                </div>
              </div>
            )}

            {/* RATING STEPS: SECTIONS A, B, C */}
            {isRatingStep && currentSection && (
              <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command flex flex-col gap-6">
                {/* Section Header */}
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-xs font-extrabold text-[#F5B800] mt-0.5">
                        {currentSection.code}
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0B2545] leading-snug">
                          {currentSection.title.replace(/^[A-Z]\.\s*/, '')}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          Rate each item from 5 (Always manifested) to 1 (Never/Rarely manifested).
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold tabular-nums ${
                        answeredInCurrentSection === totalInCurrentSection
                          ? 'bg-[#0B2545] text-white'
                          : 'bg-[#EBF1FA] text-[#0B2545]'
                      }`}
                    >
                      {answeredInCurrentSection} / {totalInCurrentSection}
                    </span>
                  </div>

                  {/* Minimalist 5 to 1 Scale Legend */}
                  <div className="grid grid-cols-5 gap-1.5 rounded-2xl bg-[#F8FAFC] p-2.5 border border-slate-200/60 text-center">
                    {ratingScale.map((scaleObj) => {
                      const shortWord = scaleObj.label.split(' ')[0];
                      return (
                        <div key={scaleObj.score} className="flex flex-col items-center">
                          <span className="text-xs font-extrabold text-[#0B2545]">
                            {scaleObj.score}
                          </span>
                          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate max-w-full">
                            {shortWord}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Criteria Questions */}
                <div className="space-y-3.5">
                  {currentSection.items?.map((item, index) => {
                    const currentScore = ratings[item.id];
                    const isAnswered = currentScore !== undefined;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                          isAnswered
                            ? 'border-[#0B2545]/25 bg-white shadow-subtle'
                            : 'border-slate-200/80 bg-[#F8FAFC]/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="flex items-start gap-3">
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold mt-0.5 tabular-nums ${
                                isAnswered
                                  ? 'bg-[#0B2545] text-white'
                                  : 'bg-[#EBF1FA] text-[#0B2545]'
                              }`}
                            >
                              {index + 1}
                            </span>
                            <p className="text-sm sm:text-[15px] font-bold text-[#0B2545] leading-relaxed">
                              {item.text || item.criterion_text}
                            </p>
                          </div>

                          {isAnswered && (
                            <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FCEFC7] text-[#0B2545] mt-0.5">
                              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </span>
                          )}
                        </div>

                        {/* 5 to 1 Rating Buttons */}
                        <div
                          className="grid grid-cols-5 gap-2"
                          role="radiogroup"
                          aria-label={`Rate statement ${index + 1}`}
                        >
                          {ratingScale.map((scaleObj) => {
                            const num = Number(scaleObj.score);
                            const isSelected = currentScore === num;
                            const labelText = scaleObj.label.split(' ')[0];

                            return (
                              <label
                                key={num}
                                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl cursor-pointer border text-center select-none transition-all ${
                                  isSelected
                                    ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-subtle'
                                    : 'bg-white text-[#0B2545] border-slate-200/90 hover:border-[#0B2545]/40 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`item-${item.id}`}
                                  value={num}
                                  checked={isSelected}
                                  onChange={() => handleRatingChange(item.id, num)}
                                  className="sr-only"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-sm sm:text-base font-extrabold leading-none tabular-nums">
                                    {num}
                                  </span>
                                  <Star
                                    className={`h-3 w-3 ${
                                      isSelected
                                        ? 'text-[#F5B800] fill-[#F5B800]'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`hidden sm:block text-[10px] font-semibold mt-1 ${
                                    isSelected ? 'text-slate-200' : 'text-slate-400'
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

            {/* FINAL INPUT STEP: QUALITATIVE COMMENTS */}
            {step === qualitativeStepIndex && (
              <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command flex flex-col gap-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-xs font-extrabold text-white mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[#0B2545] leading-snug">
                      Any comments for your teacher?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Optional written feedback for{' '}
                      <strong className="font-bold text-[#0B2545]">
                        {selectedFacultyObj?.name}
                      </strong>{' '}
                      ({course.trim().toUpperCase()}). Your identity stays anonymous.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="qualitative-comment" className="sr-only">
                    Written Remarks (Optional)
                  </label>
                  <textarea
                    id="qualitative-comment"
                    name="qualitativeComment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share what went well in class or suggestions for improvement (optional)..."
                    className="w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 text-sm sm:text-base text-[#0B2545] placeholder-slate-400 focus:bg-white focus:border-[#0B2545] transition-colors leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* CONFIRMATION RECEIPT */}
            {step === confirmationStepIndex && (
              <div className="rounded-[28px] bg-white p-6 sm:p-10 border border-slate-200/70 shadow-command text-center flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B2545] text-[#F5B800] mb-4 shadow-subtle">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </div>

                <span className="inline-block rounded-full bg-[#FCEFC7] px-3.5 py-1 text-xs font-bold text-[#0B2545] mb-3">
                  Evaluation Recorded
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B2545] mb-2 tracking-tight">
                  Thank you for rating!
                </h2>

                <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed mb-6">
                  Your anonymous response has been saved for NEMSU Cantilan.
                </p>

                {submittedSummary && (
                  <div className="w-full max-w-md rounded-2xl bg-[#F8FAFC] p-5 border border-slate-200/80 text-left mb-5 text-xs sm:text-sm space-y-2.5">
                    <div className="flex justify-between items-center gap-4 border-b border-slate-200/80 pb-2.5">
                      <span className="font-medium text-slate-500">Receipt Code</span>
                      <span className="font-mono font-extrabold text-xs text-[#0B2545] bg-[#EBF1FA] px-2.5 py-1 rounded-lg">
                        {submittedSummary.confirmationCode}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200/80 pb-2.5">
                      <span className="font-medium text-slate-500">Teacher</span>
                      <span className="font-bold text-[#0B2545] text-right">
                        {submittedSummary.faculty}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200/80 pb-2.5">
                      <span className="font-medium text-slate-500">Course</span>
                      <span className="font-bold text-[#0B2545]">
                        {submittedSummary.course}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-slate-200/80 pb-2.5">
                      <span className="font-medium text-slate-500">Department</span>
                      <span className="font-semibold text-right text-slate-700">
                        {formatDepartmentName(submittedSummary.department)} (
                        {submittedSummary.departmentCode})
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="font-medium text-slate-500">Date</span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {submittedSummary.date}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200/80 text-[11px] sm:text-xs text-slate-500 max-w-md mb-6 leading-relaxed flex items-start gap-2.5 text-left">
                  <Lock className="h-4 w-4 shrink-0 text-[#0B2545] mt-0.5" aria-hidden="true" />
                  <span>
                    In compliance with RA 10173, a one-way cryptographic hash prevents duplicate entries without linking your identity to your scores.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
                  <button
                    type="button"
                    onClick={handleEvaluateAnother}
                    className="w-full sm:flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2545] px-5 text-xs sm:text-sm font-bold text-white shadow-subtle hover:bg-[#133C6E] transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Rate another teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200 px-4 text-xs sm:text-sm font-bold text-[#0B2545] hover:bg-slate-50 transition-colors"
                  >
                    <Printer className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Print</span>
                  </button>

                  <Link
                    to="/"
                    className="w-full sm:w-auto h-11 inline-flex items-center justify-center gap-2 rounded-full bg-white border border-slate-200 px-4 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <span>Done</span>
                  </Link>
                </div>
              </div>
            )}

            {/* BOTTOM NAVIGATION BUTTONS */}
            {step < confirmationStepIndex && (
              <div className="flex items-center justify-between gap-4 pt-1">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="h-11 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-xs sm:text-sm font-bold text-[#0B2545] shadow-subtle hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Back</span>
                  </button>
                ) : (
                  <Link
                    to="/"
                    className="h-11 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-xs sm:text-sm font-bold text-slate-600 shadow-subtle hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Departments</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isVerifyingSession || isSubmitting}
                  className="h-11 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2545] px-6 text-xs sm:text-sm font-bold text-white shadow-subtle hover:bg-[#133C6E] transition-colors ml-auto disabled:opacity-60"
                >
                  {(isVerifyingSession || isSubmitting) && (
                    <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                  )}
                  <span>
                    {isVerifyingSession
                      ? 'Starting...'
                      : isSubmitting
                      ? 'Submitting...'
                      : step === qualitativeStepIndex
                      ? 'Submit evaluation'
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
      </main>

      {/* BOTTOM FOOTER */}
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 pb-6 sm:pb-8">
        <Footer />
      </div>
    </div>
  );
}
