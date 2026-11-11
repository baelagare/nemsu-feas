import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

/**
 * Minimalist Staff & HR Authentication Portal.
 * Aligned with the NEMSU Cantilan FEAS landing page design system.
 */
export default function HRLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const from = location.state?.from?.pathname || '/hr/dashboard';

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
      setError(
        result.error ||
          'Authentication failed. Please verify your institutional credentials.'
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0B2545] flex flex-col justify-between">
      {/* TOP BAR */}
      <Header
        rightContent={
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#0B2545] border border-slate-200 shadow-subtle hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
            <span>Student portal</span>
          </Link>
        }
      />

      {/* MAIN CONTENT */}
      <main className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: MINIMALIST STAFF PORTAL INTRO */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-block rounded-full bg-[#FCEFC7] px-3.5 py-1.5 text-xs font-bold text-[#0B2545] mb-5">
              Academic Deans &amp; HRMO
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight text-[#0B2545] leading-[1.08] mb-5">
              Staff analytics &amp;
              <br />
              faculty reports.
            </h1>

            <p className="text-base sm:text-[17px] text-slate-600 leading-relaxed max-w-md mb-7">
              Review department turnout, 5-point rubric averages, and anonymized student remarks for NEMSU Cantilan.
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0B2545] border border-slate-200 shadow-subtle">
                <Shield className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
                <span>Role-based access</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0B2545] border border-slate-200 shadow-subtle">
                <Lock className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
                <span>RA 10173 compliant</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0B2545] border border-slate-200 shadow-subtle">
                <BarChart3 className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
                <span>Live analytics</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SIGN IN CARD */}
          <div className="lg:col-span-6 w-full max-w-lg lg:max-w-none mx-auto">
            <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command">
              <div className="flex items-start gap-3 mb-6">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-white mt-0.5">
                  <Shield className="h-3.5 w-3.5 text-[#F5B800]" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[#0B2545] leading-snug">
                    Staff sign in
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Enter your institutional email or Staff ID to continue.
                  </p>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs sm:text-sm text-rose-800 flex items-start gap-3 mb-5 shadow-subtle"
                >
                  <AlertCircle
                    className="h-4 w-4 shrink-0 mt-0.5 text-rose-600"
                    aria-hidden="true"
                  />
                  <span className="font-semibold leading-relaxed">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="hr-identifier"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                  >
                    Email or Staff ID
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Mail className="h-4 w-4" aria-hidden="true" />
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
                      placeholder="hr.admin@nemsu.edu.ph or HR-2024-001"
                      className="w-full h-12 rounded-2xl border border-slate-200/90 bg-slate-50/50 pl-11 pr-4 text-sm sm:text-base text-[#0B2545] placeholder-slate-400 focus:bg-white focus:border-[#0B2545] transition-colors"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="hr-password"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowHelpModal(true)}
                      className="text-xs font-bold text-slate-500 hover:text-[#0B2545] underline underline-offset-2"
                    >
                      Need help?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <Lock className="h-4 w-4" aria-hidden="true" />
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
                      className="w-full h-12 rounded-2xl border border-slate-200/90 bg-slate-50/50 pl-11 pr-12 text-sm sm:text-base text-[#0B2545] placeholder-slate-400 focus:bg-white focus:border-[#0B2545] transition-colors"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-[#0B2545] rounded-r-2xl transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none py-1">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#0B2545] focus:ring-[#0B2545] accent-[#0B2545] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-medium text-slate-600">
                      Keep me signed in
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#0B2545] px-6 text-sm font-bold text-white shadow-subtle hover:bg-[#133C6E] active:bg-[#040F21] transition-colors disabled:opacity-60"
                  >
                    <span>
                      {isLoading ? 'Signing in...' : 'Sign in to dashboard'}
                    </span>
                    {!isLoading && (
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </form>
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 sm:p-7 shadow-command border border-slate-200/80">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B2545] text-[#F5B800]">
                <HelpCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h3
                  id="help-dialog-title"
                  className="text-base font-extrabold text-[#0B2545]"
                >
                  Staff Sign-In Assistance
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  HRMO &middot; NEMSU Cantilan
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Access to the analytics dashboard is restricted to verified HRMO staff and Academic Deans. Contact the Campus HR Management Office for credential resets.
            </p>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full h-11 rounded-full bg-[#0B2545] px-4 text-xs sm:text-sm font-bold text-white hover:bg-[#133C6E] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM FOOTER */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 pb-6 sm:pb-8">
        <Footer />
      </div>
    </div>
  );
}
