/**
 * NEMSU-FEAS API Client
 * Connects frontend SPA to the Laravel RESTful API backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/v1';

export const TOKEN_STORAGE_KEY = 'nemsu_auth_token';

/**
 * Universal fetch wrapper handling headers, bearer auth, and error payloads.
 */
export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
        `Request failed with status ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network or connection failure
    throw new Error(
      `Unable to connect to the NEMSU-FEAS API server at ${API_BASE_URL}. Please ensure the backend is running.`
    );
  }
}

// ---------------------------------------------------------------------------
// Authentication API
// ---------------------------------------------------------------------------

export async function loginWithCredentials(identifier, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export async function loginWithGoogle(idToken) {
  return apiFetch('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
}

export async function getCurrentUser() {
  return apiFetch('/auth/me');
}

export async function logoutUser() {
  return apiFetch('/auth/logout', {
    method: 'POST',
  });
}

// ---------------------------------------------------------------------------
// Analytics & Reporting API (HR Admin & Academic Deans)
// ---------------------------------------------------------------------------

export async function fetchAnalyticsOverview(academicPeriodId = null) {
  const query = academicPeriodId ? `?academic_period_id=${academicPeriodId}` : '';
  return apiFetch(`/analytics/overview${query}`);
}

export async function fetchDepartmentMetrics(academicPeriodId = null) {
  const query = academicPeriodId ? `?academic_period_id=${academicPeriodId}` : '';
  return apiFetch(`/analytics/departments${query}`);
}

export async function fetchFacultyRoster(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/analytics/faculty${query ? `?${query}` : ''}`);
}

export async function fetchFeedbackFeed(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/analytics/feedback${query ? `?${query}` : ''}`);
}

export function getReportExportUrl(academicPeriodId = null, departmentId = null) {
  const params = new URLSearchParams();
  if (academicPeriodId) params.append('academic_period_id', academicPeriodId);
  if (departmentId) params.append('department_id', departmentId);
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) params.append('token', token);
  return `${API_BASE_URL}/reports/export?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Student Evaluation API
// ---------------------------------------------------------------------------

export async function fetchActiveAcademicPeriod() {
  return apiFetch('/academic-periods/active');
}

export async function fetchDepartments() {
  return apiFetch('/departments');
}

export async function fetchFacultyByDepartment(departmentId) {
  return apiFetch(`/departments/${departmentId}/faculty`);
}

export async function fetchEvaluationRubric() {
  return apiFetch('/evaluations/rubric');
}

export async function submitStudentEvaluation(payload) {
  return apiFetch('/evaluations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
