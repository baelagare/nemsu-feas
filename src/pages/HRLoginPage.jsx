import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  HelpCircle,
} from 'lucide-react';
import UniversitySeal from '../components/UniversitySeal';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

/**
 * HR & Administrative Authentication Portal.
 * Strictly Navy Blue (#0B2545) & White institutional palette,
 * 48px (h-12) mobile-safe inputs and touch targets, and clear visual hierarchy.
 */
export default function HRLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, demoAccounts } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Where to redirect after login (defaults to /hr/dashboard)
  const from = location.state?.from?.pathname || '/hr/dashboard';

  // Modal keyboard escape handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showHelpModal) {
        setShowHelpModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHelpModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your institutional email or Staff ID.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    const result = await login(identifier, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Authentication failed. Please verify your institutional credentials.');
    }
  };

  // 1-Click Quick Fill for testing and demonstration
  const handleQuickFill = (acc) => {
    setIdentifier(acc.email);
    setPassword(acc.password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-900">
      {/* Top Institutional Bar — Strict Navy Blue & White */}
      <header className="bg-[#0B2545] text-white border-b border-white/15 py-3.5 px-4 sm:px-8 shadow-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
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
                HR &amp; Administrative Portal
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Authentication Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-xl bg-white border border-slate-200 shadow-card overflow-hidden">
          {/* Left Panel: Institutional Governance (Desktop Left / Mobile Second) */}
          <div className="order-2 lg:order-1 lg:col-span-5 bg-[#0B2545] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative border-t lg:border-t-0 lg:border-r border-white/15">
            <div>
              <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white border border-white/20 mb-5">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Authorized Personnel</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mb-3 leading-snug">
                Academic Deans &amp; HR Management Office
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-6">
                Sign in to review departmental faculty evaluation turnouts, standardized rating summaries, and semester reports.
              </p>

              {/* Institutional Access Guidelines */}
              <div className="border-t border-white/15 pt-5 space-y-3.5 text-xs sm:text-sm text-slate-200">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-white border border-white/15 mt-0.5">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="leading-relaxed">
                    Role-based access restricted to verified HRMO staff and Academic Deans.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-white border border-white/15 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="leading-relaxed">
                    All student evaluation records are anonymized in compliance with the Data Privacy Act of 2012 (RA 10173).
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Campus Attribution */}
            <div className="pt-5 mt-8 border-t border-white/15 text-xs text-slate-300 flex items-center justify-between gap-2">
              <div>
                <p className="font-bold text-white">Human Resource Management Office</p>
                <p className="text-slate-300 mt-0.5">NEMSU &ndash; Cantilan Campus</p>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white border border-white/15 shrink-0">
                [PLACEHOLDER: AY / Sem]
              </span>
            </div>
          </div>

          {/* Right Form Interaction Panel (Desktop Right / Mobile First) */}
          <div className="order-1 lg:order-2 lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white">
            <div>
              {/* Form Heading */}
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1.5 block">
                  Administrative Sign In
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Sign In to HR Portal
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Enter your verified institutional email or Staff ID to continue.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 flex items-start gap-3 mb-5 shadow-subtle"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
                  <span className="font-semibold leading-relaxed">{error}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Identifier Input */}
                <div>
                  <label
                    htmlFor="hr-identifier"
                    className="block text-sm font-bold text-slate-900 mb-1.5"
                  >
                    Institutional Email or Staff ID <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                      id="hr-identifier"
                      name="identifier"
                      type="text"
                      required
                      spellCheck={false}
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="e.g., hr.admin@nemsu.edu.ph"
                      className="w-full h-12 rounded-lg border border-slate-300 bg-white pl-11 pr-4 text-base text-slate-900 placeholder-slate-400 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="hr-password"
                      className="block text-sm font-bold text-slate-900"
                    >
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-xs sm:text-sm text-[#0B2545] font-bold hover:underline underline-offset-2"
                    >
                      Need help signing in?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                      id="hr-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter your password"
                      className="w-full h-12 rounded-lg border border-slate-300 bg-white pl-11 pr-12 text-base text-slate-900 placeholder-slate-400 focus:border-[#0B2545] focus-visible:ring-2 focus-visible:ring-[#0B2545]/20 transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-[#0B2545] rounded-r-lg transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545] accent-[#0B2545] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Keep session active on this device
                    </span>
                  </label>
                </div>

                {/* Submit CTA */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#0B2545] px-5 text-sm sm:text-base font-bold text-white shadow-subtle hover:bg-[#133C6E] active:bg-[#040F21] transition-colors disabled:opacity-70 disabled:cursor-wait"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Verifying credentials...</span>
                      </span>
                    ) : (
                      <>
                        <span>Sign In to Portal</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Demo / Testing Quick-Fill Helper (Positioned below form so primary login leads hierarchy) */}
            <div className="mt-7 pt-5 border-t border-slate-200">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0B2545]">
                    <KeyRound className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Quick Fill Demo Credentials</span>
                  </div>
                  <span className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                    Testing Mode
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {demoAccounts.map((acc, idx) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-300 hover:border-[#0B2545] hover:text-[#0B2545] hover:bg-slate-50 transition-colors shadow-subtle"
                      title={`Fill credentials for ${acc.name} (${acc.role})`}
                    >
                      <span className="font-bold text-[#0B2545]">
                        {idx === 0 ? 'HR Director' : 'HR Analyst'}
                      </span>
                      <span className="text-slate-500">({acc.email})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-elevated border border-slate-200">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B2545] text-white">
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id="help-dialog-title" className="text-base font-extrabold text-slate-900">
                  Portal Sign-In Assistance
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  Human Resource Management Office &bull; Cantilan Campus
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              <p>
                Access to this portal is restricted to authorized HR Personnel, Department Chairpersons, and Academic Deans.
              </p>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs sm:text-sm space-y-1.5">
                <p className="font-bold text-slate-900">Demo Account Credentials:</p>
                <p className="text-slate-700">
                  Email: <strong className="font-bold text-[#0B2545]">hr.admin@nemsu.edu.ph</strong>
                </p>
                <p className="text-slate-700">
                  Password: <strong className="font-bold text-[#0B2545]">admin123</strong>
                </p>
              </div>
              <p>
                For official account provisioning or password resets, please contact{' '}
                <strong className="font-semibold text-slate-900">[PLACEHOLDER: Support Office / Email]</strong>.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full h-11 rounded-lg bg-[#0B2545] px-4 text-sm font-bold text-white hover:bg-[#133C6E] transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <div className="max-w-5xl w-full mx-auto px-4 pb-6">
        <Footer />
      </div>
    </div>
  );
}
