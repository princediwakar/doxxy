// Path: app/(public)/tools/clinic-roi-calculator/ClinicRoiCalculator.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  Receipt,
  UserX,
  CalendarX,
  TrendingDown,
  Calculator,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { formatIndianCurrency } from "@/lib/format-currency";

// --- CONSTANTS ---

const WORKING_DAYS_PER_MONTH = 25;
const MONTHS_PER_YEAR = 12;
const DOXXY_COST_PER_CONSULTATION = 10;

const ADMIN_REDUCTION_RATE = 0.7;
const NO_SHOW_REDUCTION_RATE = 0.35;
const DOXXY_FOLLOW_UP_ADHERENCE = 0.75;

// --- HELPERS ---

function formatHours(hours: number): string {
  if (hours >= 1) {
    const whole = Math.floor(hours);
    const fraction = hours - whole;
    if (fraction === 0) return `${whole} hour${whole > 1 ? "s" : ""}`;
    const mins = Math.round(fraction * 60);
    return `${whole}h ${mins}m`;
  }
  const mins = Math.round(hours * 60);
  return `${mins} minutes`;
}

function formatUnit(value: number, unit: string): string {
  if (unit === "₹") return `₹${value}`;
  return `${value}${unit}`;
}

// --- TYPES ---

interface InputState {
  adminHoursPerDay: number;
  hourlyStaffCost: number;
  doctors: number;
  patientsPerDay: number;
  billingErrorsPer100: number;
  avgErrorAmount: number;
  noShowRate: number;
  avgRevenuePerPatient: number;
  followUpPatientsPerMonth: number;
  currentFollowUpAdherence: number;
  revenuePerFollowUp: number;
}

// --- ROI SLIDER (wraps Radix Slider with label + value display) ---

interface RoiSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

const RoiSlider = ({ label, value, min, max, step, unit, onChange }: RoiSliderProps) => (
  <div className="space-y-2">
    <div className="flex justify-between items-baseline">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
        {formatUnit(value, unit)}
      </span>
    </div>
    <Slider
      min={min}
      max={max}
      step={step}
      value={[value]}
      onValueChange={([v]) => onChange(v)}
    />
    <div className="flex justify-between text-xs text-gray-400">
      <span>{formatUnit(min, unit)}</span>
      <span>{formatUnit(max, unit)}</span>
    </div>
  </div>
);

// --- SECTION CARD ---

interface CalculatorSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

const CalculatorSection = ({ icon: Icon, title, children }: CalculatorSectionProps) => (
  <div className="bg-white dark:bg-gray-800/60 rounded-xl p-5 border border-gray-200/75 dark:border-gray-700/50">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

// --- RESULT CARD ---

interface ResultCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  footer: string;
  footerColor?: string;
}

const ResultCard = ({
  icon: Icon,
  label,
  value,
  footer,
  footerColor = "text-blue-600 dark:text-blue-400",
}: ResultCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50">
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
        {label}
      </span>
    </div>
    <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums mb-1">
      {value}
    </div>
    <div className={`text-xs ${footerColor}`}>{footer}</div>
  </div>
);

// --- MAIN COMPONENT ---

const ClinicRoiCalculator = () => {
  const [inputs, setInputs] = useState<InputState>({
    adminHoursPerDay: 3,
    hourlyStaffCost: 150,
    doctors: 1,
    patientsPerDay: 30,
    billingErrorsPer100: 5,
    avgErrorAmount: 300,
    noShowRate: 20,
    avgRevenuePerPatient: 500,
    followUpPatientsPerMonth: 50,
    currentFollowUpAdherence: 40,
    revenuePerFollowUp: 500,
  });

  const update = (key: keyof InputState) => (value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const results = useMemo(() => {
    const {
      adminHoursPerDay,
      hourlyStaffCost,
      doctors,
      patientsPerDay,
      billingErrorsPer100,
      avgErrorAmount,
      noShowRate,
      avgRevenuePerPatient,
      followUpPatientsPerMonth,
      currentFollowUpAdherence,
      revenuePerFollowUp,
    } = inputs;

    const dailyAdminCost = adminHoursPerDay * hourlyStaffCost * doctors;
    const annualAdminCost = dailyAdminCost * WORKING_DAYS_PER_MONTH * MONTHS_PER_YEAR;
    const annualAdminSavings = annualAdminCost * ADMIN_REDUCTION_RATE;
    const dailyHoursSaved = adminHoursPerDay * ADMIN_REDUCTION_RATE;
    const annualHoursSaved = dailyHoursSaved * WORKING_DAYS_PER_MONTH * MONTHS_PER_YEAR;

    const dailyBillingErrors = (patientsPerDay * billingErrorsPer100) / 100;
    const dailyBillingLoss = dailyBillingErrors * avgErrorAmount;
    const annualBillingLoss = dailyBillingLoss * WORKING_DAYS_PER_MONTH * MONTHS_PER_YEAR;
    const annualBillingSavings = annualBillingLoss;

    const monthlyPatients = patientsPerDay * WORKING_DAYS_PER_MONTH;
    const monthlyNoShows = monthlyPatients * (noShowRate / 100);
    const monthlyNoShowLoss = monthlyNoShows * avgRevenuePerPatient;
    const annualNoShowLoss = monthlyNoShowLoss * MONTHS_PER_YEAR;
    const annualNoShowSavings = annualNoShowLoss * NO_SHOW_REDUCTION_RATE;

    const currentMonthlyFollowUpRevenue =
      followUpPatientsPerMonth * (currentFollowUpAdherence / 100) * revenuePerFollowUp;
    const doxxyMonthlyFollowUpRevenue =
      followUpPatientsPerMonth * DOXXY_FOLLOW_UP_ADHERENCE * revenuePerFollowUp;
    const monthlyFollowUpRecapture = doxxyMonthlyFollowUpRevenue - currentMonthlyFollowUpRevenue;
    const annualFollowUpRecapture = monthlyFollowUpRecapture * MONTHS_PER_YEAR;

    const totalAnnualSavings =
      annualAdminSavings + annualBillingSavings + annualNoShowSavings + annualFollowUpRecapture;

    const annualConsultations = patientsPerDay * WORKING_DAYS_PER_MONTH * MONTHS_PER_YEAR;
    const doxxyAnnualCost = annualConsultations * DOXXY_COST_PER_CONSULTATION;

    const netAnnualSavings = totalAnnualSavings - doxxyAnnualCost;
    const netMonthlySavings = netAnnualSavings / MONTHS_PER_YEAR;

    return {
      annualAdminSavings,
      annualHoursSaved,
      annualBillingSavings,
      annualNoShowSavings,
      annualFollowUpRecapture,
      totalAnnualSavings,
      doxxyAnnualCost,
      netAnnualSavings,
      netMonthlySavings,
      annualConsultations,
    };
  }, [inputs]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Calculator className="h-7 w-7 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Clinic ROI Calculator
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Adjust the sliders to match your clinic&apos;s numbers. All calculations assume 25 working days per month.
        </p>
      </div>

      {/* INPUT GRID */}
      <div className="grid md:grid-cols-2 gap-5 mb-10">
        <CalculatorSection icon={Clock} title="Section A — Staff & Admin">
          <RoiSlider
            label="Receptionist/admin hours on paperwork per day"
            value={inputs.adminHoursPerDay}
            min={1} max={8} step={0.5} unit=" hrs"
            onChange={update("adminHoursPerDay")}
          />
          <RoiSlider
            label="Hourly staff cost"
            value={inputs.hourlyStaffCost}
            min={50} max={500} step={10} unit="₹"
            onChange={update("hourlyStaffCost")}
          />
          <RoiSlider
            label="Doctors in clinic"
            value={inputs.doctors}
            min={1} max={10} step={1} unit=""
            onChange={update("doctors")}
          />
        </CalculatorSection>

        <CalculatorSection icon={Receipt} title="Section B — Billing Leakage">
          <RoiSlider
            label="Patients seen per day"
            value={inputs.patientsPerDay}
            min={10} max={100} step={5} unit=""
            onChange={update("patientsPerDay")}
          />
          <RoiSlider
            label="Billing errors per 100 patients"
            value={inputs.billingErrorsPer100}
            min={1} max={15} step={1} unit=""
            onChange={update("billingErrorsPer100")}
          />
          <RoiSlider
            label="Average error amount"
            value={inputs.avgErrorAmount}
            min={100} max={1000} step={50} unit="₹"
            onChange={update("avgErrorAmount")}
          />
        </CalculatorSection>

        <CalculatorSection icon={UserX} title="Section C — No-Show Loss">
          <RoiSlider
            label="No-show rate"
            value={inputs.noShowRate}
            min={5} max={50} step={1} unit="%"
            onChange={update("noShowRate")}
          />
          <RoiSlider
            label="Average revenue per patient"
            value={inputs.avgRevenuePerPatient}
            min={200} max={2000} step={50} unit="₹"
            onChange={update("avgRevenuePerPatient")}
          />
        </CalculatorSection>

        <CalculatorSection icon={CalendarX} title="Section D — Missed Follow-Up Revenue">
          <RoiSlider
            label="Patients needing follow-up per month"
            value={inputs.followUpPatientsPerMonth}
            min={10} max={200} step={5} unit=""
            onChange={update("followUpPatientsPerMonth")}
          />
          <RoiSlider
            label="Current follow-up adherence rate"
            value={inputs.currentFollowUpAdherence}
            min={20} max={80} step={5} unit="%"
            onChange={update("currentFollowUpAdherence")}
          />
          <RoiSlider
            label="Revenue per follow-up visit"
            value={inputs.revenuePerFollowUp}
            min={200} max={1500} step={50} unit="₹"
            onChange={update("revenuePerFollowUp")}
          />
        </CalculatorSection>
      </div>

      {/* RESULTS CARD */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/40 dark:to-green-950/40 rounded-2xl border border-blue-200/50 dark:border-blue-800/30 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
          Your Estimated Annual Savings with Doxxy
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ResultCard
            icon={Clock}
            label="Admin Time Saved"
            value={formatIndianCurrency(results.annualAdminSavings)}
            footer={`${formatHours(results.annualHoursSaved)}/year freed`}
          />
          <ResultCard
            icon={Receipt}
            label="Billing Error Savings"
            value={formatIndianCurrency(results.annualBillingSavings)}
            footer="Automated billing"
          />
          <ResultCard
            icon={UserX}
            label="No-Show Reduction"
            value={formatIndianCurrency(results.annualNoShowSavings)}
            footer="WhatsApp reminders"
          />
          <ResultCard
            icon={CalendarX}
            label="Follow-Up Recapture"
            value={formatIndianCurrency(results.annualFollowUpRecapture)}
            footer="Automated recalls"
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>Gross Annual Savings</span>
            <span className="font-semibold tabular-nums">
              {formatIndianCurrency(results.totalAnnualSavings)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <span>
              Doxxy Annual Cost (₹10/consultation ×{" "}
              {results.annualConsultations.toLocaleString("en-IN")} consultations)
            </span>
            <span className="font-semibold text-red-500 tabular-nums">
              -{formatIndianCurrency(results.doxxyAnnualCost)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-base font-semibold text-gray-900 dark:text-white">
              NET Annual Savings
            </span>
            <span className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 tabular-nums">
              {formatIndianCurrency(results.netAnnualSavings)}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Monthly Equivalent</span>
            <span className="font-semibold text-green-600 dark:text-green-400 tabular-nums">
              {formatIndianCurrency(results.netMonthlySavings)}/month
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-gray-200/50 dark:border-gray-700/30">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {results.netAnnualSavings > 0
                ? `After deducting Doxxy's cost, your clinic stands to save ${formatIndianCurrency(results.netAnnualSavings)} per year. That is ${formatIndianCurrency(results.netMonthlySavings)} in additional profit every single month.`
                : `Your clinic is relatively small — but you still save ${formatIndianCurrency(Math.max(0, results.totalAnnualSavings))} in operational costs before software fees. Our free tier (first 100 consultations) means you can start saving immediately at zero cost.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicRoiCalculator;
