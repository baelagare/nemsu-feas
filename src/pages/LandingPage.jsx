import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Clock, Star, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchDepartments } from '../services/api';
import { DEPARTMENTS as FALLBACK_DEPARTMENTS, formatDepartmentName } from '../data/evaluationData';

const PREFERRED_ORDER = ['DBM', 'DCS', 'DIT', 'DGTT', 'CCJE'];

/**
 * Institutional Gateway / Landing View for NEMSU-FEAS.
 * Follows the founded Navy Blue, White, and Mustard Yellow palette.
 */
export default function LandingPage() {
  const [departments, setDepartments] = useState(FALLBACK_DEPARTMENTS);

  useEffect(() => {
    let isMounted = true;
    async function loadDepartments() {
      try {
        const res = await fetchDepartments();
        if (!isMounted || !res?.data || res.data.length === 0) return;

        const mapped = res.data.map((d) => ({
          id: d.id,
          code: d.code,
          name: formatDepartmentName(d.name),
          fullName: d.name,
        }));

        mapped.sort((a, b) => {
          const idxA = PREFERRED_ORDER.indexOf(a.code);
          const idxB = PREFERRED_ORDER.indexOf(b.code);
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
        });

        setDepartments(mapped);
      } catch {
        // Fallback departments remain active if backend is unreachable
      }
    }
    loadDepartments();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0B2545] flex flex-col justify-between">
      {/* Accessible Skip Link */}
      <a href="#department-selection" className="skip-to-content">
        Skip to department selection
      </a>

      {/* TOP BAR */}
      <Header
        rightContent={
          <Link
            to="/hr/login"
            data-testid="role-card-hr"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-bold text-[#0B2545] border border-slate-200 shadow-subtle hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
            <span>Staff sign in</span>
          </Link>
        }
      />

      {/* MAIN CONTENT */}
      <main
        id="department-selection"
        className="w-full max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-14 my-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* LEFT COLUMN: HERO MESSAGING */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="inline-block rounded-full bg-[#FCEFC7] px-3.5 py-1.5 text-xs font-bold text-[#0B2545] mb-5">
              Student Evaluation of Teachers
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#0B2545] leading-[1.08] mb-5">
              How was your class
              <br />
              this semester?
            </h1>

            <p className="text-base sm:text-[17px] text-slate-600 leading-relaxed max-w-md mb-6">
              Rate your teachers in about 2 minutes. No login, and your answers stay anonymous.
            </p>

            {/* 5-Star Visual Indicator */}
            <div className="flex items-center gap-2.5 mb-7" aria-hidden="true">
              {[1, 2, 3, 4].map((star) => (
                <Star
                  key={star}
                  className="h-7 w-7 text-[#F5B800] fill-[#F5B800]"
                />
              ))}
              <Star className="h-7 w-7 text-[#DCE6F4] fill-[#DCE6F4]" />
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0B2545] border border-slate-200 shadow-subtle">
                <Lock className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
                <span>Anonymous</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0B2545] border border-slate-200 shadow-subtle">
                <Clock className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
                <span>About 2 minutes</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#0B2545] border border-slate-200 shadow-subtle">
                <Star className="h-3.5 w-3.5 text-[#0B2545]" aria-hidden="true" />
                <span>Rate 1 to 5</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PICK YOUR DEPARTMENT CARD */}
          <div className="lg:col-span-6 w-full max-w-lg lg:max-w-none mx-auto">
            <div className="rounded-[28px] bg-white p-6 sm:p-8 border border-slate-200/70 shadow-command">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0B2545] text-xs font-extrabold text-white mt-0.5">
                  1
                </div>
                <div>
                  <h2 className="text-xl sm:text-[22px] font-extrabold tracking-tight text-[#0B2545] leading-snug">
                    Pick your department
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Then choose your teacher and rate.
                  </p>
                </div>
              </div>

              <div
                className="space-y-3"
                role="region"
                aria-label="Academic departments"
              >
                {departments.map((dept, index) => (
                  <Link
                    key={dept.code}
                    to={`/student/evaluation?dept=${dept.code}`}
                    state={{ departmentId: dept.id, departmentCode: dept.code }}
                    data-testid={index === 0 ? 'role-card-student' : `dept-card-${dept.code}`}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-3.5 hover:border-[#0B2545]/40 hover:bg-slate-50/70 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EBF1FA] text-xs font-extrabold text-[#0B2545]">
                        {dept.code}
                      </div>
                      <span className="text-sm sm:text-[15px] font-bold text-[#0B2545] truncate">
                        {dept.name}
                      </span>
                    </div>

                    <ChevronRight
                      className="h-4 w-4 text-[#0B2545] shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER */}
      <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 pb-6 sm:pb-8">
        <Footer />
      </div>
    </div>
  );
}
