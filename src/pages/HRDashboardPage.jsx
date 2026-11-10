import React, { useState, useMemo, useEffect } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Layers,
} from 'lucide-react';
import UniversitySeal from '../components/UniversitySeal';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import {
  fetchAnalyticsOverview,
  fetchDepartmentMetrics,
  fetchFacultyRoster,
  fetchFeedbackFeed,
  fetchAdminRubric,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  createRubricSection,
  updateRubricSection,
  deleteRubricSection,
  createRubricCriterion,
  updateRubricCriterion,
  deleteRubricCriterion,
} from '../services/api';

/**
 * HR & Academic Deans Administrative Analytics Portal.
 * Strictly Navy Blue (#0B2545) & White institutional design system,
 * Plus Jakarta Sans tabular typography, and complete interactive functionality
 * across all 5 tabs (System Overview, Department Matrix, Faculty Roster, Qualitative Feedback, Rubric Customizer).
 */

export default function HRDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isHrAdmin = user?.role === 'hr_admin';

  // Live Data State
  const [overview, setOverview] = useState(null);
  const [departmentMetrics, setDepartmentMetrics] = useState([]);
  const [facultyRoster, setFacultyRoster] = useState([]);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [rubricSections, setRubricSections] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // CRUD Banner / Toast Notification
  const [crudNotification, setCrudNotification] = useState(null);

  // Faculty CRUD State
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    department_id: '',
    employment_status: 'permanent',
    is_active: true,
  });
  const [facultyFormError, setFacultyFormError] = useState('');
  const [isSubmittingFaculty, setIsSubmittingFaculty] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [isDeletingFaculty, setIsDeletingFaculty] = useState(false);

  // Rubric Section CRUD State
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    code: '',
    title: '',
    description: '',
    display_order: 1,
  });
  const [sectionFormError, setSectionFormError] = useState('');
  const [isSubmittingSection, setIsSubmittingSection] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState(null);
  const [isDeletingSection, setIsDeletingSection] = useState(false);

  // Rubric Criterion CRUD State
  const [showCriterionModal, setShowCriterionModal] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState(null);
  const [criterionForm, setCriterionForm] = useState({
    section_id: '',
    item_code: '',
    criterion_text: '',
    display_order: 1,
    is_active: true,
  });
  const [criterionFormError, setCriterionFormError] = useState('');
  const [isSubmittingCriterion, setIsSubmittingCriterion] = useState(false);
  const [criterionToDelete, setCriterionToDelete] = useState(null);
  const [isDeletingCriterion, setIsDeletingCriterion] = useState(false);

  // Navigation & Interactive Filter State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'departments' | 'faculty' | 'sentiment' | 'rubric'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [facultySortBy, setFacultySortBy] = useState('rating-desc'); // 'rating-desc' | 'rating-asc' | 'responses-desc' | 'name-asc'
  const [feedbackCategory, setFeedbackCategory] = useState('ALL');

  // Modals / Drawers
  const [selectedFacultyDetail, setSelectedFacultyDetail] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState('');

  // Fetch Live Analytics Data
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        setIsLoadingData(true);
        const [overviewRes, deptRes, facRes, feedRes] = await Promise.all([
          fetchAnalyticsOverview(),
          fetchDepartmentMetrics(),
          fetchFacultyRoster(),
          fetchFeedbackFeed(),
        ]);

        if (!isMounted) return;

        if (overviewRes?.data) setOverview(overviewRes.data);

        if (deptRes?.data) {
          setDepartmentMetrics(
            deptRes.data.map((d) => ({
              id: d.id,
              code: d.code,
              name: d.name,
              deanName: d.dean_name,
              facultyCount: d.faculty_count,
              totalResponses: d.evaluations_count,
              targetResponses: d.target_evaluations,
              completion: d.completion_rate,
              avgRating: d.average_rating,
              status: d.descriptive_rating,
            }))
          );
        }

        if (facRes?.data) {
          setFacultyRoster(
            facRes.data.map((f) => ({
              id: f.id,
              name: f.name,
              email: f.email,
              departmentId: f.department_id,
              dept: f.department_code,
              deptName: f.department_name,
              employmentStatus: f.employment_status || 'permanent',
              courses: f.courses || 'Assigned Courses',
              responses: f.evaluations_count,
              rating: f.composite_mean,
              sectionA: f.section_a_mean,
              sectionB: f.section_b_mean,
              sectionC: f.section_c_mean,
              status: f.descriptive_rating,
            }))
          );
        }

        if (feedRes?.data) {
          setFeedbackItems(feedRes.data);
        }

        if (isHrAdmin) {
          const rubricRes = await fetchAdminRubric().catch(() => null);
          if (isMounted && rubricRes?.data) {
            setRubricSections(rubricRes.data);
          }
        }
      } catch (err) {
        console.error('Failed to load analytics dashboard data:', err);
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [isHrAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/hr/login');
  };

  // Helper re-fetch functions
  const refreshFacultyData = async () => {
    try {
      const [facRes, deptRes, overviewRes] = await Promise.all([
        fetchFacultyRoster(),
        fetchDepartmentMetrics(),
        fetchAnalyticsOverview(),
      ]);
      if (facRes?.data) {
        setFacultyRoster(
          facRes.data.map((f) => ({
            id: f.id,
            name: f.name,
            email: f.email,
            departmentId: f.department_id,
            dept: f.department_code,
            deptName: f.department_name,
            employmentStatus: f.employment_status || 'permanent',
            courses: f.courses || 'Assigned Courses',
            responses: f.evaluations_count,
            rating: f.composite_mean,
            sectionA: f.section_a_mean,
            sectionB: f.section_b_mean,
            sectionC: f.section_c_mean,
            status: f.descriptive_rating,
          }))
        );
      }
      if (deptRes?.data) {
        setDepartmentMetrics(
          deptRes.data.map((d) => ({
            id: d.id,
            code: d.code,
            name: d.name,
            deanName: d.dean_name,
            facultyCount: d.faculty_count,
            totalResponses: d.evaluations_count,
            targetResponses: d.target_evaluations,
            completion: d.completion_rate,
            avgRating: d.average_rating,
            status: d.descriptive_rating,
          }))
        );
      }
      if (overviewRes?.data) setOverview(overviewRes.data);
    } catch (err) {
      console.error('Failed to reload faculty data:', err);
    }
  };

  const refreshRubricData = async () => {
    try {
      const res = await fetchAdminRubric();
      if (res?.data) {
        setRubricSections(res.data);
      }
    } catch (err) {
      console.error('Failed to reload rubric:', err);
    }
  };

  // Faculty CRUD Handlers
  const handleOpenAddFaculty = () => {
    setEditingFaculty(null);
    setFacultyForm({
      name: '',
      email: '',
      department_id: departmentMetrics[0]?.id || '',
      employment_status: 'permanent',
      is_active: true,
    });
    setFacultyFormError('');
    setShowFacultyModal(true);
  };

  const handleOpenEditFaculty = (fac) => {
    setEditingFaculty(fac);
    setFacultyForm({
      name: fac.name || '',
      email: fac.email || '',
      department_id: fac.departmentId || departmentMetrics.find(d => d.code === fac.dept)?.id || '',
      employment_status: fac.employmentStatus || 'permanent',
      is_active: true,
    });
    setFacultyFormError('');
    setShowFacultyModal(true);
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    if (!facultyForm.name.trim()) {
      setFacultyFormError('Faculty member name is required.');
      return;
    }
    if (!facultyForm.department_id) {
      setFacultyFormError('Please select an academic department.');
      return;
    }

    try {
      setIsSubmittingFaculty(true);
      setFacultyFormError('');

      const payload = {
        name: facultyForm.name.trim(),
        email: facultyForm.email.trim() || null,
        department_id: Number(facultyForm.department_id),
        employment_status: facultyForm.employment_status,
        is_active: Boolean(facultyForm.is_active),
      };

      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, payload);
        setCrudNotification({
          type: 'success',
          message: `Faculty member "${payload.name}" updated successfully.`,
        });
      } else {
        await createFaculty(payload);
        setCrudNotification({
          type: 'success',
          message: `Faculty member "${payload.name}" added to roster successfully.`,
        });
      }

      setShowFacultyModal(false);
      await refreshFacultyData();
    } catch (err) {
      setFacultyFormError(err.message || 'Failed to save faculty record.');
    } finally {
      setIsSubmittingFaculty(false);
    }
  };

  const handleConfirmDeleteFaculty = async () => {
    if (!facultyToDelete) return;
    try {
      setIsDeletingFaculty(true);
      const res = await deleteFaculty(facultyToDelete.id);
      setCrudNotification({
        type: res?.deactivated ? 'warning' : 'success',
        message: res?.message || `Faculty member "${facultyToDelete.name}" removed successfully.`,
      });
      setFacultyToDelete(null);
      await refreshFacultyData();
    } catch (err) {
      setCrudNotification({
        type: 'error',
        message: err.message || 'Failed to delete faculty member.',
      });
    } finally {
      setIsDeletingFaculty(false);
    }
  };

  // Section CRUD Handlers
  const handleOpenAddSection = () => {
    setEditingSection(null);
    setSectionForm({
      code: '',
      title: '',
      description: '',
      display_order: rubricSections.length + 1,
    });
    setSectionFormError('');
    setShowSectionModal(true);
  };

  const handleOpenEditSection = (sec) => {
    setEditingSection(sec);
    setSectionForm({
      code: sec.code || '',
      title: sec.title || '',
      description: sec.description || '',
      display_order: sec.display_order || 1,
    });
    setSectionFormError('');
    setShowSectionModal(true);
  };

  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!sectionForm.code.trim()) {
      setSectionFormError('Section code is required (e.g. D).');
      return;
    }
    if (!sectionForm.title.trim()) {
      setSectionFormError('Section title is required.');
      return;
    }

    try {
      setIsSubmittingSection(true);
      setSectionFormError('');

      const payload = {
        code: sectionForm.code.trim().toUpperCase(),
        title: sectionForm.title.trim(),
        description: sectionForm.description.trim() || null,
        display_order: Number(sectionForm.display_order) || 1,
      };

      if (editingSection) {
        await updateRubricSection(editingSection.id, payload);
        setCrudNotification({
          type: 'success',
          message: `Evaluation section "${payload.code}" updated successfully.`,
        });
      } else {
        await createRubricSection(payload);
        setCrudNotification({
          type: 'success',
          message: `Evaluation section "${payload.code}" created successfully.`,
        });
      }

      setShowSectionModal(false);
      await refreshRubricData();
    } catch (err) {
      setSectionFormError(err.message || 'Failed to save rubric section.');
    } finally {
      setIsSubmittingSection(false);
    }
  };

  const handleConfirmDeleteSection = async () => {
    if (!sectionToDelete) return;
    try {
      setIsDeletingSection(true);
      const res = await deleteRubricSection(sectionToDelete.id);
      setCrudNotification({
        type: 'success',
        message: res?.message || `Section "${sectionToDelete.code}" deleted successfully.`,
      });
      setSectionToDelete(null);
      await refreshRubricData();
    } catch (err) {
      setCrudNotification({
        type: 'error',
        message: err.message || 'Failed to delete section.',
      });
    } finally {
      setIsDeletingSection(false);
    }
  };

  // Criterion CRUD Handlers
  const handleOpenAddCriterion = (sec) => {
    setEditingCriterion(null);
    const count = (sec.criteria?.length || 0) + 1;
    setCriterionForm({
      section_id: sec.id,
      item_code: `${sec.code.toLowerCase()}${count}`,
      criterion_text: '',
      display_order: count,
      is_active: true,
    });
    setCriterionFormError('');
    setShowCriterionModal(true);
  };

  const handleOpenEditCriterion = (sec, crit) => {
    setEditingCriterion(crit);
    setCriterionForm({
      section_id: sec.id,
      item_code: crit.item_code || '',
      criterion_text: crit.criterion_text || '',
      display_order: crit.display_order || 1,
      is_active: crit.is_active !== undefined ? Boolean(crit.is_active) : true,
    });
    setCriterionFormError('');
    setShowCriterionModal(true);
  };

  const handleSaveCriterion = async (e) => {
    e.preventDefault();
    if (!criterionForm.item_code.trim()) {
      setCriterionFormError('Item code is required (e.g. a7).');
      return;
    }
    if (!criterionForm.criterion_text.trim()) {
      setCriterionFormError('Question/criterion text is required.');
      return;
    }

    try {
      setIsSubmittingCriterion(true);
      setCriterionFormError('');

      const payload = {
        section_id: Number(criterionForm.section_id),
        item_code: criterionForm.item_code.trim().toLowerCase(),
        criterion_text: criterionForm.criterion_text.trim(),
        display_order: Number(criterionForm.display_order) || 1,
        is_active: Boolean(criterionForm.is_active),
      };

      if (editingCriterion) {
        await updateRubricCriterion(editingCriterion.id, payload);
        setCrudNotification({
          type: 'success',
          message: `Evaluation question "${payload.item_code}" updated successfully.`,
        });
      } else {
        await createRubricCriterion(payload);
        setCrudNotification({
          type: 'success',
          message: `Evaluation question "${payload.item_code}" added successfully.`,
        });
      }

      setShowCriterionModal(false);
      await refreshRubricData();
    } catch (err) {
      setCriterionFormError(err.message || 'Failed to save evaluation question.');
    } finally {
      setIsSubmittingCriterion(false);
    }
  };

  const handleConfirmDeleteCriterion = async () => {
    if (!criterionToDelete) return;
    try {
      setIsDeletingCriterion(true);
      const res = await deleteRubricCriterion(criterionToDelete.id);
      setCrudNotification({
        type: res?.deactivated ? 'warning' : 'success',
        message: res?.message || `Criterion "${criterionToDelete.item_code}" removed.`,
      });
      setCriterionToDelete(null);
      await refreshRubricData();
    } catch (err) {
      setCrudNotification({
        type: 'error',
        message: err.message || 'Failed to delete criterion.',
      });
    } finally {
      setIsDeletingCriterion(false);
    }
  };

  // Jump to Faculty Roster filtered by a specific department
  const handleInspectDepartmentRoster = (deptCode) => {
    setSelectedDeptFilter(deptCode);
    setActiveTab('faculty');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    return departmentMetrics.filter((dept) => {
      const matchesDept = selectedDeptFilter === 'ALL' || dept.code === selectedDeptFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [departmentMetrics, selectedDeptFilter, searchQuery]);

  // Filtered & Sorted Faculty Roster
  const filteredFaculty = useMemo(() => {
    const filtered = facultyRoster.filter((fac) => {
      const matchesDept = selectedDeptFilter === 'ALL' || fac.dept === selectedDeptFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || fac.status === selectedStatusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fac.courses && fac.courses.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (fac.dept && fac.dept.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (fac.deptName && fac.deptName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDept && matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (facultySortBy === 'rating-desc') return b.rating - a.rating;
      if (facultySortBy === 'rating-asc') return a.rating - b.rating;
      if (facultySortBy === 'responses-desc') return b.responses - a.responses;
      if (facultySortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [facultyRoster, selectedDeptFilter, selectedStatusFilter, searchQuery, facultySortBy]);

  // Filtered Qualitative Feedback Themes
  const filteredFeedbackThemes = useMemo(() => {
    return feedbackItems.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        (item.comment && item.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.faculty_name && item.faculty_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.course_code && item.course_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.department_code && item.department_code.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [feedbackItems, searchQuery]);

  // Real CSV Export Handler from Backend API
  const handleDownloadCSV = async () => {
    try {
      const token = localStorage.getItem('nemsu_auth_token');
      const response = await fetch('http://127.0.0.1:8001/api/v1/reports/export', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nemsu-feas-faculty-evaluation-report-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExportSuccessMessage('Official institutional audit report CSV downloaded successfully.');
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    }
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
                {user?.name}
              </span>
              <span className="text-xs font-medium text-slate-300">
                {user?.role || 'HR Administrator'}{user?.staffId ? ` \u2022 ${user.staffId}` : ''}
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
                { id: 'departments', label: 'Department Matrix', count: departmentMetrics.length },
                { id: 'faculty', label: 'Faculty Roster', count: facultyRoster.length },
                { id: 'sentiment', label: 'Qualitative Feedback', count: feedbackItems.length },
                ...(isHrAdmin
                  ? [{ id: 'rubric', label: 'Evaluation Form (Rubric)', count: rubricSections.length }]
                  : []),
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
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* CRUD Notification Toast / Alert Banner */}
        {crudNotification && (
          <div
            className={`rounded-xl p-4 flex items-center justify-between gap-3 border shadow-subtle ${
              crudNotification.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : crudNotification.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-3">
              {crudNotification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
              ) : crudNotification.type === 'warning' ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
              )}
              <span className="text-xs sm:text-sm font-semibold">{crudNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setCrudNotification(null)}
              className="p-1 rounded-md hover:bg-black/5 text-current"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* GLOBAL FILTER & ACTION TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl bg-white p-4 sm:p-5 border border-slate-200 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {activeTab === 'overview' && 'Institutional Evaluation Overview'}
                {activeTab === 'departments' && 'Academic Department Performance Matrix'}
                {activeTab === 'faculty' && 'Complete Faculty Evaluation Roster'}
                {activeTab === 'sentiment' && 'Anonymized Student Feedback & Themes'}
                {activeTab === 'rubric' && 'Official Evaluation Form (SET Questionnaire Rubric)'}
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
                <option value="ALL">All Departments</option>
                {departmentMetrics.map((d) => (
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
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight my-1">
                  {overview?.kpis?.total_evaluations ?? 0}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Verified Single-Entry</span>
                  <span className="font-bold text-slate-700">{overview?.kpis?.completion_rate ?? 0}% Turnout</span>
                </div>
              </div>

              {/* KPI 2 */}
              <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-card flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Faculty Evaluated
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight my-1">
                  {overview?.kpis?.evaluated_faculty_count ?? 0}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Of {overview?.kpis?.active_faculty_count ?? 0} Active</span>
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
                <div className="text-3xl font-black text-slate-900 tracking-tight my-1">
                  {overview?.kpis?.overall_mean ? Number(overview.kpis.overall_mean).toFixed(2) : '0.00'}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-bold text-slate-700">{overview?.kpis?.descriptive_rating ?? 'No Evaluations'}</span>
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
                </div>
                <div className="text-3xl font-black text-slate-900 tracking-tight my-1">
                  {feedbackItems.length}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Qualitative Feedback</span>
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
                                  {Number(dept.avgRating || 0).toFixed(2)}
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
                  <span className="font-medium">Total Verified Responses</span>
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
                      All {facultyRoster.length} Faculty &rarr;
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
                              {Number(fac.rating || 0).toFixed(2)}
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
                        recent observations from written remarks
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
                    {feedbackItems.length === 0 ? (
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 text-center">
                        No student feedback remarks recorded yet.
                      </div>
                    ) : (
                      feedbackItems.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {item.faculty_name}
                            </span>
                            <span className="rounded bg-[#0B2545] px-2 py-0.5 text-xs font-bold text-white tabular-nums shrink-0">
                              {item.department_code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                            &ldquo;{item.comment}&rdquo;
                          </p>
                        </div>
                      ))
                    )}
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
                  Showing {filteredDepartments.length} of {departmentMetrics.length} Departments
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
                            Code: <strong className="font-semibold text-slate-700">{dept.code}</strong> &bull; {dept.deanName}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center tabular-nums font-semibold text-slate-800">
                          {dept.facultyCount}
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
                          {Number(dept.sectionA || dept.avgRating || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-700">
                          {Number(dept.sectionB || dept.avgRating || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-3 text-right tabular-nums font-semibold text-slate-700">
                          {Number(dept.sectionC || dept.avgRating || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="inline-flex items-center justify-center rounded-md bg-[#0B2545] px-2.5 py-1 text-xs sm:text-sm font-extrabold text-white tabular-nums">
                            {Number(dept.avgRating || 0).toFixed(2)}
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
                    Evaluated Faculty Roster ({filteredFaculty.length} of {facultyRoster.length})
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Click any instructor row or &ldquo;Inspect Report&rdquo; to view their Section A/B/C scores and student remarks.
                  </p>
                </div>

                {/* Rating Status Filter, Sort Order & Add Faculty Action */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {isHrAdmin && (
                    <button
                      type="button"
                      onClick={handleOpenAddFaculty}
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg bg-[#0B2545] text-white text-xs sm:text-sm font-bold hover:bg-[#133C6E] transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>Add Faculty</span>
                    </button>
                  )}

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
                      <th className="py-3.5 px-5 text-right font-bold">Actions</th>
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
                            <div className="text-xs text-slate-500 mt-0.5">{fac.status} &bull; <span className="capitalize">{fac.employmentStatus}</span></div>
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
                            {Number(fac.sectionA || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-3 text-right tabular-nums text-slate-600">
                            {Number(fac.sectionB || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-3 text-right tabular-nums text-slate-600">
                            {Number(fac.sectionC || 0).toFixed(2)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="inline-flex items-center justify-center rounded-md bg-[#0B2545] px-2.5 py-1 text-xs font-extrabold text-white tabular-nums">
                              {Number(fac.rating || 0).toFixed(2)}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFacultyDetail(fac);
                                }}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-[#0B2545] hover:border-[#0B2545] hover:bg-slate-50 transition-colors"
                                title="Inspect Analytics Report"
                              >
                                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="hidden xl:inline">Inspect</span>
                              </button>
                              {isHrAdmin && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenEditFaculty(fac);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-[#0B2545] hover:text-[#0B2545] hover:bg-slate-50 transition-colors"
                                    title="Edit Faculty Member"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="hidden xl:inline">Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFacultyToDelete(fac);
                                    }}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
                                    title="Delete or Deactivate Faculty"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                    <span className="hidden xl:inline">Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
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
                      {cat === 'ALL' ? 'All Domains' : cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredFeedbackThemes.length === 0 ? (
                <div className="col-span-2 rounded-xl bg-white p-8 border border-slate-200 text-center text-slate-500">
                  No qualitative feedback comments recorded yet for this view.
                </div>
              ) : (
                filteredFeedbackThemes.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-white p-5 sm:p-6 border border-slate-200 shadow-card flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1">
                            {item.department_code} &bull; Course: {item.course_code}
                          </span>
                          <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                            {item.faculty_name}
                          </h4>
                        </div>
                        <span className="rounded-md bg-[#0B2545] px-2.5 py-1 text-xs font-extrabold text-white tabular-nums shrink-0">
                          Score: {item.composite_mean ? Number(item.composite_mean).toFixed(2) : 'N/A'}
                        </span>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs sm:text-sm text-slate-800 mt-2">
                        <p className="leading-relaxed whitespace-pre-line">
                          &ldquo;{item.comment}&rdquo;
                        </p>
                        <div className="text-[11px] font-bold text-slate-500 mt-2">
                          Submitted on {item.submitted_at ? new Date(item.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Current Term'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 5: EVALUATION FORM (RUBRIC & QUESTIONNAIRE INSTRUMENT)
        =================================================================== */}
        {activeTab === 'rubric' && isHrAdmin && (
          <div className="flex flex-col gap-6">
            {/* Rubric Tab Header */}
            <div className="rounded-xl bg-white p-5 sm:p-6 border border-slate-200 shadow-card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] block mb-1">
                  SET Evaluation Instrument Customizer
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Official Questionnaire Sections &amp; Criteria
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Configure evaluation sections, performance domains, and individual criteria questions. Changes immediately reflect in active student evaluations.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSection}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#0B2545] text-white text-xs sm:text-sm font-bold hover:bg-[#133C6E] transition-colors self-start sm:self-auto shrink-0 shadow-sm"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Add Section</span>
              </button>
            </div>

            {/* Section Cards */}
            {rubricSections.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center border border-slate-200 shadow-card text-slate-500">
                No evaluation sections configured. Click &ldquo;Add Section&rdquo; to create one.
              </div>
            ) : (
              rubricSections.map((sec) => (
                <div key={sec.id} className="rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
                  {/* Section Header */}
                  <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white font-extrabold text-sm">
                        {sec.code}
                      </span>
                      <div>
                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
                          {sec.title}
                        </h4>
                        {sec.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {sec.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenAddCriterion(sec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#0B2545] text-[#0B2545] text-xs font-bold hover:bg-[#0B2545] hover:text-white transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Add Question</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditSection(sec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:border-[#0B2545] hover:text-[#0B2545] transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSectionToDelete(sec)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 hover:border-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Criteria / Questions List in Section */}
                  <div className="p-5 sm:p-6">
                    {!sec.criteria || sec.criteria.length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                        No criteria questions yet in this section. Click &ldquo;Add Question&rdquo; to add one.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sec.criteria.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-extrabold uppercase bg-slate-100 text-[#0B2545] border border-slate-200 shrink-0">
                                {item.item_code}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                                  {item.criterion_text}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                                  <span>Order: {item.display_order}</span>
                                  <span>&bull;</span>
                                  <span className={item.is_active ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                                    {item.is_active ? 'Active' : 'Archived / Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => handleOpenEditCriterion(sec, item)}
                                className="p-1.5 rounded-md text-slate-500 hover:text-[#0B2545] hover:bg-slate-100 transition-colors"
                                title="Edit question text and order"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCriterionToDelete(item)}
                                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete or deactivate question"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
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
                    {Number(selectedFacultyDetail.rating || 0).toFixed(2)} / 5.00
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
                      <span className="tabular-nums text-[#0B2545]">{Number(sec.score || 0).toFixed(2)} / 5.00</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-[#0B2545] rounded-full"
                        style={{ width: `${(Number(sec.score || 0) / 5) * 100}%` }}
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
                      NEMSU &ndash; Cantilan Campus
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
                      {departmentMetrics.map((d) => (
                        <tr key={d.code} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{d.name}</td>
                          <td className="p-3 text-right tabular-nums">{d.facultyCount}</td>
                          <td className="p-3 text-right tabular-nums">{d.totalResponses}</td>
                          <td className="p-3 text-right tabular-nums">{d.completion}%</td>
                          <td className="p-3 text-right font-extrabold text-[#0B2545] tabular-nums">
                            {Number(d.avgRating || 0).toFixed(2)}
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

        {/* ===================================================================
            MODAL 3: ADD / EDIT FACULTY MEMBER
        =================================================================== */}
        {showFacultyModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="faculty-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="faculty-modal-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                      {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      NEMSU Institutional Teaching Directory
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFacultyModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {facultyFormError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{facultyFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveFaculty} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={facultyForm.name}
                    onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                    placeholder="e.g. Engr. Maria Santos, MSIT"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Institutional Email Address
                  </label>
                  <input
                    type="email"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                    placeholder="e.g. msantos@nemsu.edu.ph"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Optional. Used for automated score summary dispatch.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Academic Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={facultyForm.department_id}
                    onChange={(e) => setFacultyForm({ ...facultyForm, department_id: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-medium focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  >
                    <option value="">Select Department...</option>
                    {departmentMetrics.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} &ndash; {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Employment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={facultyForm.employment_status}
                    onChange={(e) => setFacultyForm({ ...facultyForm, employment_status: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-medium focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  >
                    <option value="permanent">Permanent / Regular Faculty</option>
                    <option value="contractual">Contractual / Temporary</option>
                    <option value="part-time">Part-Time / Adjunct</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="faculty-active-toggle"
                    checked={facultyForm.is_active}
                    onChange={(e) => setFacultyForm({ ...facultyForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545]"
                  />
                  <label htmlFor="faculty-active-toggle" className="text-xs font-semibold text-slate-700">
                    Active in Current Student Evaluation Roster
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowFacultyModal(false)}
                    className="h-11 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingFaculty}
                    className="h-11 px-5 rounded-lg bg-[#0B2545] hover:bg-[#133C6E] text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSubmittingFaculty && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span>{editingFaculty ? 'Save Changes' : 'Create Faculty'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 4: CONFIRM DELETE FACULTY
        =================================================================== */}
        {facultyToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-faculty-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="delete-faculty-title" className="text-base font-extrabold text-slate-900">
                    Remove Faculty Member
                  </h3>
                  <p className="text-xs text-slate-500">
                    {facultyToDelete.name} ({facultyToDelete.dept})
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Are you sure you want to remove <strong className="text-slate-900">{facultyToDelete.name}</strong>?
                <br /><br />
                <span className="text-slate-500">
                  Note: If this instructor already has recorded student evaluations, their record will be safely deactivated/archived to protect institutional historical rating integrity.
                </span>
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFacultyToDelete(null)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFaculty}
                  disabled={isDeletingFaculty}
                  className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isDeletingFaculty && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 5: ADD / EDIT RUBRIC SECTION
        =================================================================== */}
        {showSectionModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="section-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white">
                    <Layers className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="section-modal-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                      {editingSection ? 'Edit Evaluation Section' : 'Add Evaluation Section'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      SET Questionnaire Domain Heading
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {sectionFormError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{sectionFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveSection} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={sectionForm.code}
                      onChange={(e) => setSectionForm({ ...sectionForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. D"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-bold uppercase focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={sectionForm.display_order}
                      onChange={(e) => setSectionForm({ ...sectionForm, display_order: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Section Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                    placeholder="e.g. Professionalism and Community Outreach"
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Description / Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })}
                    placeholder="Instructions presented to student evaluators for this domain..."
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowSectionModal(false)}
                    className="h-11 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingSection}
                    className="h-11 px-5 rounded-lg bg-[#0B2545] hover:bg-[#133C6E] text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSubmittingSection && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span>{editingSection ? 'Save Section' : 'Create Section'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 6: CONFIRM DELETE RUBRIC SECTION
        =================================================================== */}
        {sectionToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-section-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="delete-section-title" className="text-base font-extrabold text-slate-900">
                    Delete Evaluation Section
                  </h3>
                  <p className="text-xs text-slate-500">
                    Section {sectionToDelete.code} &ndash; {sectionToDelete.title}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Are you sure you want to delete this section? Deleting this section will also remove all its criteria questions.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSectionToDelete(null)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteSection}
                  disabled={isDeletingSection}
                  className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isDeletingSection && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>Delete Section</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 7: ADD / EDIT EVALUATION CRITERION QUESTION
        =================================================================== */}
        {showCriterionModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="criterion-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="criterion-modal-title" className="text-base sm:text-lg font-extrabold text-slate-900">
                      {editingCriterion ? 'Edit Evaluation Question' : 'Add Evaluation Question'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Individual Rubric Rating Statement
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCriterionModal(false)}
                  className="rounded-lg p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="Close dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {criterionFormError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs sm:text-sm font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{criterionFormError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCriterion} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Evaluation Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={criterionForm.section_id}
                    onChange={(e) => setCriterionForm({ ...criterionForm, section_id: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm font-medium focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  >
                    <option value="">Select Section...</option>
                    {rubricSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        Section {sec.code} &ndash; {sec.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Item Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={criterionForm.item_code}
                      onChange={(e) => setCriterionForm({ ...criterionForm, item_code: e.target.value.toLowerCase() })}
                      placeholder="e.g. a7, d1"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm lowercase focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={criterionForm.display_order}
                      onChange={(e) => setCriterionForm({ ...criterionForm, display_order: e.target.value })}
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Question Statement / Criterion Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={criterionForm.criterion_text}
                    onChange={(e) => setCriterionForm({ ...criterionForm, criterion_text: e.target.value })}
                    placeholder="Enter the specific teaching competency or criterion students will rate from 1 to 5..."
                    className="w-full p-3 rounded-lg border border-slate-300 text-sm focus:border-[#0B2545] focus:outline-none focus:ring-1 focus:ring-[#0B2545]"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="criterion-active-toggle"
                    checked={criterionForm.is_active}
                    onChange={(e) => setCriterionForm({ ...criterionForm, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545]"
                  />
                  <label htmlFor="criterion-active-toggle" className="text-xs font-semibold text-slate-700">
                    Active (Include in student evaluation form)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCriterionModal(false)}
                    className="h-11 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCriterion}
                    className="h-11 px-5 rounded-lg bg-[#0B2545] hover:bg-[#133C6E] text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSubmittingCriterion && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span>{editingCriterion ? 'Save Question' : 'Add Question'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 8: CONFIRM DELETE CRITERION
        =================================================================== */}
        {criterionToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-criterion-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
          >
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
              <div className="flex items-center gap-3.5 pb-4 mb-4 border-b border-slate-200">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="delete-criterion-title" className="text-base font-extrabold text-slate-900">
                    Remove Evaluation Question
                  </h3>
                  <p className="text-xs text-slate-500">
                    Item Code: {criterionToDelete.item_code}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Are you sure you want to remove this question?
                <br /><br />
                <span className="italic text-slate-800">&ldquo;{criterionToDelete.criterion_text}&rdquo;</span>
                <br /><br />
                <span className="text-slate-500">
                  Note: If student ratings already reference this question, it will be safely deactivated/archived to preserve evaluation records.
                </span>
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setCriterionToDelete(null)}
                  className="h-10 px-4 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteCriterion}
                  disabled={isDeletingCriterion}
                  className="h-10 px-5 rounded-lg bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-bold text-white transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isDeletingCriterion && <RefreshCw className="h-4 w-4 animate-spin" />}
                  <span>Confirm Delete</span>
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
