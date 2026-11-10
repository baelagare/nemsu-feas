import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ClipboardCheck,
  Lock,
  Building2,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RoleCard from '../components/RoleCard';
import UniversitySeal from '../components/UniversitySeal';

/**
 * Institutional Gateway / Landing View for NEMSU-FEAS.
 * Strictly Navy Blue & White palette with mobile-first ergonomics.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* Accessible Skip Link */}
      <a href="#role-selection" className="skip-to-content">
        Skip to portal selection
      </a>

      {/* MOBILE-ONLY COMPACT INSTITUTIONAL HEADER (< 1024px) */}
      <div className="lg:hidden bg-[#0B2545] px-5 py-4 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 p-1 border border-white/20">
            <UniversitySeal className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 truncate">
              NEMSU &bull; Cantilan Campus
            </p>
            <h1 className="text-base font-extrabold tracking-tight text-white truncate">
              Faculty Evaluation System
            </h1>
          </div>
        </div>
      </div>

      {/* LEFT PANEL (Desktop Left / Mobile Below Role Selection):
          Institutional Overview & Evaluation Guidelines */}
      <section
        aria-label="University Branding and Evaluation Guidelines"
        className="landing-brand-canvas order-2 lg:order-1 w-full lg:w-[46%] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 text-white shrink-0"
      >
        {/* 1. Desktop Institutional Header */}
        <div className="hidden lg:block">
          <Header />
        </div>

        {/* 2. Institutional Mandate & Structured Evaluation Standards */}
        <div className="my-6 lg:my-8 max-w-xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Faculty Performance Evaluation &amp; Academic Analytics
          </h2>

          <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-normal mb-8">
            The official evaluation portal of North Eastern Mindanao State University &ndash; Cantilan Campus.
            Student ratings support instructional quality assurance, faculty tenure review, and departmental development.
          </p>

          {/* Clean Institutional Standards List */}
          <div className="border-t border-white/15 pt-6 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Institutional Evaluation Standards
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15 mt-0.5">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Confidential Student Submissions
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-0.5">
                    Student identities are verified solely to prevent duplicate entries and are never displayed in faculty or dean reports.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15 mt-0.5">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Standardized 5-Point Rating Instrument
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-0.5">
                    Instructors are assessed across Teaching Effectiveness, Pedagogical Approach, and Classroom Transparency.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white border border-white/15 mt-0.5">
                  <Building2 className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Departmental &amp; HR Reporting
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-0.5">
                    Aggregated evaluation scores and qualitative feedback summaries are compiled for Academic Deans and the HRMO.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* RIGHT PANEL (Desktop Right / Mobile Top):
          Primary Role Selection Gateway */}
      <main
        id="role-selection"
        className="order-1 lg:order-2 w-full lg:w-[54%] lg:min-h-screen flex flex-col justify-between p-5 sm:p-10 lg:p-12 xl:p-16 bg-[#F8FAFC]"
      >
        <div className="my-auto w-full max-w-xl mx-auto">
          {/* Section Heading */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0B2545] mb-1.5">
              Portal Access
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
              Select Your Portal
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Choose your role below to begin a faculty evaluation or sign in to the administrative dashboard.
            </p>
          </div>

          {/* Role Selection Cards: Primary (Student) + Secondary (HR/Deans) */}
          <div
            className="grid grid-cols-1 gap-4"
            role="region"
            aria-label="User role options"
          >
            {/* Primary Action: Student Evaluator */}
            <RoleCard
              testId="role-card-student"
              variant="primary"
              to="/student/evaluation"
              badgeText="For Students • No Account Required"
              title="Student Evaluation of Teachers (SET)"
              description="Submit ratings and feedback for your enrolled courses this semester. Your responses remain strictly anonymous."
              ctaText="Start Faculty Evaluation"
              icon={GraduationCap}
            />

            {/* Secondary Action: HR & Deans */}
            <RoleCard
              testId="role-card-hr"
              variant="secondary"
              to="/hr/login"
              badgeText="For Academic Deans & HRMO • Login Required"
              title="HR & Administrative Analytics Portal"
              description="Review departmental evaluation turnout, faculty rating summaries, and qualitative feedback reports."
              ctaText="Sign In to Admin Portal"
              icon={ShieldCheck}
            />
          </div>

          {/* Data Privacy Act Notice */}
          <div className="mt-6 rounded-xl bg-white p-4 border border-slate-200 shadow-subtle text-xs sm:text-sm text-slate-600 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#0B2545] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="leading-relaxed">
              <span className="font-bold text-slate-900">Data Privacy Assurance:</span>{' '}
              In compliance with the Data Privacy Act of 2012 (RA 10173), student evaluation responses are processed confidentially for institutional quality assurance and are never linked to your identity in faculty reports.
            </div>
          </div>

          {/* Institutional Footer */}
          <Footer />
        </div>
      </main>
    </div>
  );
}
