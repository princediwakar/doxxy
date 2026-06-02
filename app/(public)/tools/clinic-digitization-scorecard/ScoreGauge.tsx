// Path: app/(public)/tools/clinic-digitization-scorecard/ScoreGauge.tsx
"use client";

import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

function getScoreColor(percentage: number): string {
  if (percentage <= 20) return "#EF4444"; // red
  if (percentage <= 40) return "#F97316"; // orange
  if (percentage <= 60) return "#EAB308"; // yellow
  if (percentage <= 80) return "#22C55E"; // light green
  return "#16A34A"; // green
}

export default function ScoreGauge({
  percentage,
  size = 200,
  strokeWidth = 14,
}: ScoreGaugeProps) {
  const [animatedOffset, setAnimatedOffset] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const targetOffset =
    circumference - (percentage / 100) * circumference;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 60);
    return () => clearTimeout(timeout);
  }, [targetOffset]);

  const color = getScoreColor(percentage);

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="inline-block"
      >
        {/* Group rotated so stroke starts from top (12 o'clock) */}
        <g transform={`rotate(-90 ${center} ${center})`}>
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            style={{
              transition: "stroke-dashoffset 1.2s ease-in-out",
            }}
          />
        </g>
        {/* Score text in center (outside rotated group, renders upright) */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-4xl font-bold select-none"
          fill={color}
        >
          {percentage}%
        </text>
      </svg>
    </div>
  );
}
