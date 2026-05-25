"use client";

import { useState, useCallback } from "react";

const AVG_CONSULTATION_FEE = 500;
const NO_SHOW_RATE = 0.15;
const RECOVERY_RATE = 0.8;
const PRICE_PER_APPT = 10;
const WORKING_DAYS = 26;

function fmt(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

export default function CalculatorROI() {
  const [apptsPerDay, setApptsPerDay] = useState(40);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setApptsPerDay(Number(e.target.value));
    },
    []
  );

  const monthlyAppts = apptsPerDay * WORKING_DAYS;
  const revenueLost = monthlyAppts * NO_SHOW_RATE * AVG_CONSULTATION_FEE;
  const revenueRecovered = revenueLost * RECOVERY_RATE;
  const doxxyFee = monthlyAppts * (1 - NO_SHOW_RATE) * PRICE_PER_APPT;
  const netSaved = revenueRecovered - doxxyFee;

  const fillPct = ((apptsPerDay - 10) / (150 - 10)) * 100;

  return (
    <section className="bg-[hsl(40,20%,98%)] dark:bg-gray-900 py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center leading-tight mb-4">
          What happens when admin disappears?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center text-lg mb-14 max-w-xl mx-auto">
          No-shows. Billing delays. Hours lost to notes. Here&apos;s what they&apos;re costing you — and what Doxxy gives back.
        </p>

        <div className="mb-12">
          <div className="flex justify-between items-baseline mb-3">
            <label
              htmlFor="appt-slider"
              className="text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Appointments per day across all doctors
            </label>
            <span className="text-3xl font-bold text-blue-600 tabular-nums">
              {apptsPerDay}
            </span>
          </div>
          <div className="relative">
            <input
              id="appt-slider"
              type="range"
              min={10}
              max={150}
              step={5}
              value={apptsPerDay}
              onChange={handleChange}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-blue-600"
              style={{
                background: `linear-gradient(to right, hsl(210,100%,50%) 0%, hsl(210,100%,50%) ${fillPct}%, #e5e7eb ${fillPct}%, #e5e7eb 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
              <span>10</span>
              <span>40</span>
              <span>80</span>
              <span>120</span>
              <span>150</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-red-200 dark:border-red-900/50 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Monthly revenue lost to no-shows
            </p>
            <p className="text-3xl font-bold text-red-500 mb-1">
              ₹{fmt(revenueLost)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              at {NO_SHOW_RATE * 100}% no-show rate, ₹{AVG_CONSULTATION_FEE}/visit
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-green-200 dark:border-green-900/50 text-center relative ring-2 ring-blue-600 ring-offset-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
              With Doxxy
            </div>
            <div className="flex items-center justify-center gap-1.5 mb-2 mt-1">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-green-600"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue recovered by WhatsApp reminders
              </p>
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">
              ₹{fmt(revenueRecovered)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {RECOVERY_RATE * 100}% recovery with automated reminders
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Your monthly Doxxy fee
            </p>
            <p className="text-3xl font-bold text-blue-600 mb-1">
              ₹{fmt(doxxyFee)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              ₹10 per completed visit · cancelled = free
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-lg text-gray-700 dark:text-gray-200">
            <strong className="text-green-600 text-xl">₹{fmt(netSaved)}</strong>{" "}
            net saved every month — and your doctors go home on time.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
            If a patient cancels, you pay nothing. Doxxy is a partner in your
            growth, not a tax on it.
          </p>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-4">
            Plus ~90 minutes of clinical note time saved every day. That&apos;s 39 hours a month back in your life.
          </p>
        </div>
      </div>
    </section>
  );
}
