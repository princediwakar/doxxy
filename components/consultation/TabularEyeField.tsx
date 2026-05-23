// components/consultation/TabularEyeField.tsx
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { TabularEyeValue } from "@/types/consultation";

interface TabularEyeFieldProps {
  value: TabularEyeValue;
  onChange: (value: TabularEyeValue) => void;
  isReadOnly?: boolean;
}

export const TabularEyeField = ({
  value,
  onChange,
  isReadOnly = false,
}: TabularEyeFieldProps) => {
  const [showNotes, setShowNotes] = useState(!!value.notes);

  const handleEyeChange = (
    examination: string,
    side: "left" | "right",
    newValue: string
  ) => {
    const fieldName = `${examination}_${side}` as keyof TabularEyeValue;
    onChange({
      ...value,
      [fieldName]: newValue,
    });
  };

  const handleNotesChange = (newNotes: string) => {
    onChange({
      ...value,
      notes: newNotes,
    });
  };

  const toggleNotes = () => {
    if (isReadOnly) return;
    setShowNotes(!showNotes);
    if (showNotes && !value.notes) {
      // If hiding notes and no notes exist, remove the notes field
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { notes, ...rest } = value;
      onChange({ ...rest, notes: null });
    }
  };

  const allEyeExaminations = [
    // Visual Function Tests
    { key: "visual_acuity", label: "Visual Acuity" },
    { key: "refraction", label: "Refraction" },

    // Anterior Segment Examination
    { key: "extraocular_movements", label: "Extraocular Movements" },
    { key: "lids", label: "Lids" },
    { key: "conjunctiva", label: "Conjunctiva" },
    { key: "cornea", label: "Cornea" },
    { key: "anterior_chamber", label: "Anterior Chamber" },
    { key: "iris", label: "Iris" },
    { key: "pupil_examination", label: "Pupil" },
    { key: "lens", label: "Lens" },
    { key: "intraocular_pressure", label: "Intraocular Pressure" },
    { key: "slit_lamp_exam", label: "Slit Lamp Exam" },

    // Posterior Segment Examination
    { key: "fundus_exam", label: "Fundus Examination" },
  ];

  return (
    <div className="space-y-4">
      {/* Single Flat Table for All Eye Examinations */}
      <div className="pl-6 border-l-2 border-blue-200">


        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/2">
                  EXAMINATION
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/4">
                  RIGHT
                </th>
                <th className="text-left py-2 px-3 text-sm font-medium text-foreground bg-muted w-1/4">
                  LEFT
                </th>
              </tr>
            </thead>
            <tbody>
              {allEyeExaminations.map((exam, index) => (
                <tr
                  key={exam.key}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted"}
                >
                  <td className="py-2 px-3 text-sm font-medium text-foreground border-b border-border w-1/2">
                    {exam.label}
                  </td>
                  <td className="py-2 px-3 border-b border-border w-1/4">
                    <div className="flex justify-center">
                      <Textarea
                        placeholder="Enter findings"
                        value={
                          value[`${exam.key}_right` as keyof TabularEyeValue] ||
                          ""
                        }
                        onChange={(e) =>
                          handleEyeChange(exam.key, "right", e.target.value)
                        }
                        className="w-48 min-h-[80px] resize-none"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 border-b border-border w-1/4">
                    <div className="flex justify-center">
                      <Textarea
                        placeholder="Enter findings"
                        value={
                          value[`${exam.key}_left` as keyof TabularEyeValue] ||
                          ""
                        }
                        onChange={(e) =>
                          handleEyeChange(exam.key, "left", e.target.value)
                        }
                        className="w-48 min-h-[80px] resize-none"
                        readOnly={isReadOnly}
                        disabled={isReadOnly}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notes section */}
      <div className="space-y-2 pl-6 border-l-2 border-blue-200">
        <button
          type="button"
          onClick={toggleNotes}
          disabled={isReadOnly}
          className={`text-sm font-medium transition-colors ${
            isReadOnly
              ? "text-muted-foreground cursor-not-allowed"
              : "text-blue-600 hover:text-blue-700 cursor-pointer"
          }`}
        >
          {showNotes ? "Hide Additional Notes" : "+ Add Additional Notes"}
        </button>

        {showNotes && (
          <Textarea
            placeholder="Enter additional eye examination findings..."
            value={value.notes || ""}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-[60px] resize-none"
            readOnly={isReadOnly}
            disabled={isReadOnly}
          />
        )}
      </div>
    </div>
  );
};
