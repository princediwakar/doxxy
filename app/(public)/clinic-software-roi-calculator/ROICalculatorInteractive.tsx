// Path: app/(public)/clinic-software-roi-calculator/ROICalculatorInteractive.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const WORKING_DAYS = 26;
const PRICE_PER_APPT = 10;
const RECOVERY_RATE = 0.8;
const ADMIN_TIME_REDUCTION = 0.75;

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(n));
}

// --- SUB-COMPONENTS ---

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  suffix?: string;
  isDark: boolean;
  onChange: (value: number) => void;
}

const SliderInput = ({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  suffix = "",
  isDark,
  onChange,
}: SliderInputProps) => {
  const fillPct = ((value - min) / (max - min)) * 100;
  const trackColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <div className="mb-8">
      <div className="flex justify-between items-baseline mb-3">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </label>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
          {unit}
          {value % 1 !== 0 ? value.toFixed(1) : value}
          {suffix}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) =>
              onChange(Number(e.target.value)),
            [onChange]
          )}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-gray-700 accent-blue-600"
          style={{
            background: `linear-gradient(to right, #2563eb 0%, #2563eb ${fillPct}%, ${trackColor} ${fillPct}%, ${trackColor} 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-2">
          <span>
            {unit}
            {min}
            {suffix}
          </span>
          <span>
            {unit}
            {Math.round((min + max) / 2)}
            {suffix}
          </span>
          <span>
            {unit}
            {max}
            {suffix}
          </span>
        </div>
      </div>
    </div>
  );
};

// Custom tooltip for the pie chart
const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { name: string; value: number } }> }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm shadow-sm">
        <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
        <p className="text-gray-600 dark:text-gray-300">
          ₹{fmtCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---

export default function ROICalculatorInteractive() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [patientsPerDay, setPatientsPerDay] = useState(40);
  const [revenuePerPatient, setRevenuePerPatient] = useState(500);
  const [noShowRate, setNoShowRate] = useState(15);
  const [adminHoursPerDay, setAdminHoursPerDay] = useState(4);

  // --- CALCULATIONS ---
  const monthlyPatients = patientsPerDay * WORKING_DAYS;
  const revenueLost =
    monthlyPatients * (noShowRate / 100) * revenuePerPatient;
  const revenueRecovered = revenueLost * RECOVERY_RATE;
  const doxxyFee =
    monthlyPatients * (1 - noShowRate / 100) * PRICE_PER_APPT;
  const adminHoursSaved =
    adminHoursPerDay * WORKING_DAYS * ADMIN_TIME_REDUCTION;
  const netFinancialBenefit = revenueRecovered - doxxyFee;
  const adminTimeValue = adminHoursSaved * 200;
  const totalValue = netFinancialBenefit + adminTimeValue;

  // --- CHART DATA ---
  const chartData = useMemo(() => {
    const doxxyShare = Math.max(0, doxxyFee);
    const savingsShare = Math.max(0, netFinancialBenefit);

    if (doxxyShare === 0 && savingsShare === 0) return [];

    return [
      { name: "Doxxy Fee", value: doxxyShare },
      { name: "Net Savings", value: savingsShare },
    ];
  }, [doxxyFee, netFinancialBenefit]);

  const CHART_COLORS = ["#3b82f6", "#22c55e"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/75 dark:border-gray-700/50 p-6 sm:p-8">
      {/* Sliders */}
      <div className="max-w-2xl mx-auto">
        <SliderInput
          label="Patients per day (all doctors)"
          value={patientsPerDay}
          min={5}
          max={200}
          step={5}
          isDark={isDark}
          onChange={setPatientsPerDay}
        />
        <SliderInput
          label="Average revenue per patient"
          value={revenuePerPatient}
          min={200}
          max={2000}
          step={50}
          unit="₹"
          isDark={isDark}
          onChange={setRevenuePerPatient}
        />
        <SliderInput
          label="Current no-show rate"
          value={noShowRate}
          min={5}
          max={50}
          step={1}
          suffix="%"
          isDark={isDark}
          onChange={setNoShowRate}
        />
        <SliderInput
          label="Staff admin hours per day"
          value={adminHoursPerDay}
          min={0.5}
          max={12}
          step={0.5}
          suffix=" hrs"
          isDark={isDark}
          onChange={setAdminHoursPerDay}
        />
      </div>

      {/* Results Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        {/* Revenue Lost */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-red-200 dark:border-red-900/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-medium">
            Revenue Lost
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">
            ₹{fmtCurrency(revenueLost)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {fmtCurrency(monthlyPatients)} patients &times; {noShowRate}% no-show &times; ₹{fmtCurrency(revenuePerPatient)}
          </p>
        </div>

        {/* Revenue Recovered — highlighted "With Doxxy" card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-green-200 dark:border-green-900/50 text-center relative ring-2 ring-blue-600 ring-offset-2">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-0.5 rounded-full whitespace-nowrap">
            With Doxxy
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-1 uppercase tracking-wider font-medium">
            Revenue Recovered
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
            ₹{fmtCurrency(revenueRecovered)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {RECOVERY_RATE * 100}% recovery via WhatsApp reminders
          </p>
        </div>

        {/* Doxxy Fee */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-blue-200 dark:border-blue-900/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-medium">
            Monthly Doxxy Fee
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
            ₹{fmtCurrency(doxxyFee)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            ₹10 &times; {fmtCurrency(Math.round(monthlyPatients * (1 - noShowRate / 100)))} completed visits
          </p>
        </div>

        {/* Admin Hours Saved */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/50 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider font-medium">
            Admin Hours Saved
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 mb-1">
            {Math.round(adminHoursSaved)} hrs
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {ADMIN_TIME_REDUCTION * 100}% reduction from {adminHoursPerDay} hrs/day
          </p>
        </div>
      </div>

      {/* Chart + Summary Section */}
      <div className="mt-10 grid md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
        {/* Donut Chart */}
        <div className="h-64 flex flex-col items-center justify-center">
          {chartData.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-wider font-medium">
                Where Your Money Goes
              </p>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Adjust sliders to see breakdown
            </div>
          )}
          {/* Chart Legend */}
          {chartData.length > 0 && (
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Doxxy Fee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Net Savings</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="text-center md:text-left space-y-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
              Net Financial Benefit
            </p>
            <p
              className={`text-3xl font-bold ${
                netFinancialBenefit >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              ₹{fmtCurrency(netFinancialBenefit)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Recovered revenue minus Doxxy fee
            </p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
              Value of Admin Time Saved
            </p>
            <p className="text-xl font-semibold text-amber-600">
              ₹{fmtCurrency(adminTimeValue)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {Math.round(adminHoursSaved)} hours valued at ₹200/hr
            </p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              Total Monthly Value
            </p>
            <p className="text-4xl font-bold text-blue-600">
              ₹{fmtCurrency(totalValue)}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              That&apos;s ₹{fmtCurrency(totalValue * 12)} per year
            </p>
          </div>
        </div>
      </div>

      {/* Bottom note */}
      <div className="mt-10 text-center border-t border-gray-100 dark:border-gray-700 pt-8">
        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md mx-auto">
          These numbers are based on data from 200+ Indian clinics. Your results
          may vary, but the direction is always positive — clinics see net savings
          from month one.
        </p>
      </div>
    </div>
  );
}
