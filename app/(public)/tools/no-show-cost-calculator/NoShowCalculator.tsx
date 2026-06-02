// Path: app/(public)/tools/no-show-cost-calculator/NoShowCalculator.tsx
"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatIndianCurrency, formatIndianNumber } from "@/lib/format-currency";
import Link from "next/link";
import {
  TrendingDown,
  ArrowRight,
  CalendarX,
  IndianRupee,
  AlertTriangle,
  Bell,
  Clock,
  MessageCircle,
} from "lucide-react";

const WORKING_DAYS_PER_MONTH = 25;
const WORKING_DAYS_PER_YEAR = 25 * 12; // 300

export default function NoShowCalculator() {
  const [patientsPerDay, setPatientsPerDay] = useState(20);
  const [revenuePerPatient, setRevenuePerPatient] = useState(500);
  const [noShowRate, setNoShowRate] = useState(25);

  const noShowsPerDay = useMemo(
    () => Math.round((patientsPerDay * noShowRate) / 100),
    [patientsPerDay, noShowRate]
  );

  const dailyLoss = useMemo(
    () => noShowsPerDay * revenuePerPatient,
    [noShowsPerDay, revenuePerPatient]
  );

  const monthlyLoss = useMemo(
    () => dailyLoss * WORKING_DAYS_PER_MONTH,
    [dailyLoss]
  );

  const annualLoss = useMemo(
    () => dailyLoss * WORKING_DAYS_PER_YEAR,
    [dailyLoss]
  );

  const annualLostPatients = useMemo(
    () => noShowsPerDay * WORKING_DAYS_PER_YEAR,
    [noShowsPerDay]
  );

  const lossSeverity = useMemo(() => {
    if (annualLoss < 500000) return "low";
    if (annualLoss < 1500000) return "medium";
    return "high";
  }, [annualLoss]);

  const severityColors = {
    low: {
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      label: "Significant",
    },
    medium: {
      bar: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-200 dark:border-orange-800",
      label: "Severe",
    },
    high: {
      bar: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      label: "Critical",
    },
  };

  const severity = severityColors[lossSeverity];

  return (
    <div>
      {/* Calculator Inputs */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {/* Patients per day */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Patients Per Day
            </label>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {patientsPerDay}
            </span>
          </div>
          <Slider
            min={5}
            max={100}
            step={1}
            value={[patientsPerDay]}
            onValueChange={([v]) => setPatientsPerDay(v)}
            className="w-full"
          />
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>5</span>
            <span>100</span>
          </div>
        </div>

        {/* Revenue per patient */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Avg Revenue Per Patient
            </label>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{revenuePerPatient}
            </span>
          </div>
          <Slider
            min={200}
            max={2000}
            step={50}
            value={[revenuePerPatient]}
            onValueChange={([v]) => setRevenuePerPatient(v)}
            className="w-full"
          />
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>₹200</span>
            <span>₹2,000</span>
          </div>
        </div>

        {/* No-show rate */}
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No-Show Rate
            </label>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {noShowRate}%
            </span>
          </div>
          <Slider
            min={5}
            max={50}
            step={1}
            value={[noShowRate]}
            onValueChange={([v]) => setNoShowRate(v)}
            className="w-full"
          />
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>5%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <CalendarX className="h-4 w-4" />
            Daily No-Shows
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {noShowsPerDay} patients
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <IndianRupee className="h-4 w-4" />
            Daily Loss
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatIndianCurrency(dailyLoss)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="h-4 w-4" />
            Monthly Loss
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatIndianCurrency(monthlyLoss)}
          </div>
          <div className="text-xs text-gray-400 mt-1">{WORKING_DAYS_PER_MONTH} working days</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/75 dark:border-gray-700/50 p-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <AlertTriangle className="h-4 w-4" />
            Annual Lost Patients
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatIndianNumber(annualLostPatients)}
          </div>
          <div className="text-xs text-gray-400 mt-1">patients never see you</div>
        </div>
      </div>

      {/* Annual Loss - Large Visual */}
      <div
        className={`rounded-2xl border ${severity.border} ${severity.bg} p-8 md:p-12 mb-16 text-center`}
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3">
          Your Annual Revenue Lost to No-Shows
        </p>
        <div className={`text-5xl md:text-7xl font-extrabold ${severity.text} mb-4 leading-none`}>
          {formatIndianCurrency(annualLoss)}
        </div>
        <p className={`text-lg font-semibold ${severity.text} mb-2`}>
          {lossSeverity === "high"
            ? "Critical — This leakage demands immediate action."
            : lossSeverity === "medium"
              ? "Severe — Your practice is haemorrhaging revenue every month."
              : "Significant — Even a partial reduction transforms your bottom line."}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Based on {patientsPerDay} patients/day, {noShowRate}% no-show rate, {WORKING_DAYS_PER_YEAR} working days/year
        </p>
      </div>

      {/* How Doxxy Stops This Leakage */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-8 md:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            How Doxxy Stops This Leakage
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                WhatsApp Reminders
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automated reminders 24 hours before every appointment. 98% open rates — your patients actually read them.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                One-Tap Confirmation
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Patients confirm or reschedule with a single tap. Your appointment book updates in real time.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                35% No-Show Reduction
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Doxxy clinics report a 35% drop in no-shows within the first 60 days. Average annual savings: ₹1.8L per clinic.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            asChild
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-8 py-3 text-base font-semibold transition-transform hover:scale-105"
          >
            <Link href="/whatsapp-appointment-reminders">
              See How WhatsApp Reminders Work <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            asChild
            variant="outline"
            className="rounded-xl px-8 py-3 text-base font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Link href="https://wa.me/+917388890554">
              Start Free Practice <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
