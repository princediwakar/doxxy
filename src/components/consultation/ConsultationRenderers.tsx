// components/consultation/ConsultationRenderers.tsx
import React from "react";
import {
  FieldValue,
  PrescriptionMedication,
  VitalSignsData,
  EyeData,
  MotorExamData,
  ReflexExamData,
  TabularEyeValue,
} from "./types";

// --- Helper: Neuro Table (Shared by Motor & Reflex) ---

interface ConsultationTableProps {
  title: string;
  headers: string[];
  rows: { key: string; label: string }[];
  // Accepts either motor or reflex data
  data: MotorExamData | ReflexExamData;
}

const ConsultationTable: React.FC<ConsultationTableProps> = ({
  title,
  headers,
  rows,
  data,
}) => {
  // Cast to Record<string, string> to allow dynamic access (e.g., `${row.key}_left`)
  // This is safe because we know the structure matches the logic below
  const safeData = data as Record<string, string | undefined>;

  const hasData = rows.some(
    (row) => safeData[`${row.key}_left`] || safeData[`${row.key}_right`]
  );

  if (!hasData) return null;

  return (
    <div className="space-y-1">
      <div className="text-gray-700 font-semibold text-xs">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-auto border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-0.5 px-1 bg-gray-50 font-medium">
                {headers[0]}
              </th>
              <th className="text-left py-0.5 px-1 bg-gray-50 font-medium">
                {headers[1]}
              </th>
              <th className="text-left py-0.5 px-1 bg-gray-50 font-medium">
                {headers[2]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const left = safeData[`${row.key}_left`];
              const right = safeData[`${row.key}_right`];

              if (!left && !right) return null;

              return (
                <tr
                  key={row.key}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-0.5 px-1 border-b border-gray-200">
                    {row.label}
                  </td>
                  <td className="py-0.5 px-1 border-b border-gray-200">
                    {right || "-"}
                  </td>
                  <td className="py-0.5 px-1 border-b border-gray-200">
                    {left || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Specific Renderers ---

export const PrescriptionList: React.FC<{
  value: PrescriptionMedication[];
}> = ({ value }) => {
  const validPrescriptions = Array.isArray(value)
    ? value.filter((med) => med.name && med.name.trim().length > 0)
    : [];

  if (validPrescriptions.length === 0) return null;

  return (
    <div className="prescription-list mt-2">
      <div className="prescription-table">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1 px-2 bg-gray-50">Medicine</th>
              <th className="text-left py-1 px-2 bg-gray-50">Dosage</th>
              <th className="text-left py-1 px-2 bg-gray-50">Frequency</th>
              <th className="text-left py-1 px-2 bg-gray-50">Duration</th>
              <th className="text-left py-1 px-2 bg-gray-50">Instructions</th>
            </tr>
          </thead>
          <tbody>
            {validPrescriptions.map((medication, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-1 px-2 font-medium">{medication.name}</td>
                <td className="py-1 px-2">{medication.dosage || "-"}</td>
                <td className="py-1 px-2">{medication.frequency || "-"}</td>
                <td className="py-1 px-2">{medication.duration || "-"}</td>
                <td className="py-1 px-2">{medication.instructions || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const VitalSignsDisplay: React.FC<{ data: VitalSignsData }> = ({
  data,
}) => {
  const renderItem = (
    label: string,
    value: string | undefined,
    unit: string = ""
  ) => {
    if (!value) return null;
    return (
      <div key={label} className="flex items-center gap-1">
        <span className="text-gray-700 font-medium text-sm">{label}:</span>
        <span className="text-sm">
          {value} {unit}
        </span>
      </div>
    );
  };

  const items = [];
  if (data.temperature) items.push(renderItem("Temp", data.temperature, "°C"));
  if (data.pulse) items.push(renderItem("Pulse", data.pulse, "bpm"));
  if (data.blood_pressure_systolic || data.blood_pressure_diastolic) {
    items.push(
      <div key="bp" className="flex items-center gap-1">
        <span className="text-gray-700 font-medium text-sm">B.P.:</span>
        <span className="text-sm">
          {data.blood_pressure_systolic || "-"}/
          {data.blood_pressure_diastolic || "-"} mmHg
        </span>
      </div>
    );
  }
  if (data.respiratory_rate)
    items.push(renderItem("Resp. Rate", data.respiratory_rate, "/min"));
  if (data.oxygen_saturation)
    items.push(renderItem("O₂ Sat", data.oxygen_saturation, "%"));
  if (data.height) items.push(renderItem("Height", data.height, "cm"));
  if (data.weight) items.push(renderItem("Weight", data.weight, "kg"));
  if (data.bmi) items.push(renderItem("BMI", data.bmi));

  return (
    <div className="vital-signs-display">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
        {items}
      </div>
    </div>
  );
};

export const EyeFieldDisplay: React.FC<{ data: EyeData }> = ({ data }) => {
  return (
    <div className="eye-field-display space-y-2">
      {(data.left || data.right) && (
        <div className="space-y-2 text-sm">
          {data.left && (
            <div className="flex items-start gap-2">
              <div className="text-gray-700 font-semibold text-sm min-w-[40px] pt-0.5">
                Left:
              </div>
              <div className="whitespace-pre-wrap">{data.left}</div>
            </div>
          )}
          {data.right && (
            <div className="flex items-start gap-2">
              <div className="text-gray-700 font-semibold text-sm min-w-[40px] pt-0.5">
                Right:
              </div>
              <div className="whitespace-pre-wrap">{data.right}</div>
            </div>
          )}
        </div>
      )}
      {data.notes && (
        <div className="space-y-1">
          <div className="text-gray-700 font-semibold">Additional Notes</div>
          <div className="text-gray-700">{data.notes}</div>
        </div>
      )}
    </div>
  );
};

export const MotorExaminationDisplay: React.FC<{ data: MotorExamData }> = ({
  data,
}) => {
  const muscleGroups = [
    { key: "shoulder", label: "Shoulder" },
    { key: "elbow", label: "Elbow" },
    { key: "wrist", label: "Wrist" },
    { key: "hip", label: "Hip" },
    { key: "knee", label: "Knee" },
    { key: "ankle", label: "Ankle" },
  ];

  const additionalFields: { key: keyof MotorExamData; label: string }[] = [
    { key: "muscle_tone", label: "Muscle Tone" },
    { key: "muscle_bulk", label: "Muscle Bulk" },
    { key: "involuntary_movements", label: "Involuntary Movements" },
    { key: "coordination", label: "Coordination" },
  ];

  return (
    <div className="motor-examination-display space-y-3">
      <ConsultationTable
        title="Muscle Strength (0-5 Scale)"
        headers={["POWER", "R", "L"]}
        rows={muscleGroups}
        data={data}
      />

      <div className="space-y-2">
        {additionalFields.map((field) => {
          const val = data[field.key];
          if (!val) return null;
          return (
            <div key={field.key} className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">{field.label}:</span>
              <span>{val}</span>
            </div>
          );
        })}
        {data.notes && (
          <div className="space-y-1">
            <div className="text-gray-700 font-semibold">Additional Notes</div>
            <div className="text-gray-700">{data.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ReflexExaminationDisplay: React.FC<{ data: ReflexExamData }> = ({
  data,
}) => {
  const deepTendon = [
    { key: "biceps", label: "Biceps (B)" },
    { key: "triceps", label: "Triceps (T)" },
    { key: "supinator", label: "Supinator (S)" },
    { key: "knee", label: "Knee (K)" },
    { key: "ankle", label: "Ankle (A)" },
  ];
  const superficial = [
    { key: "plantar", label: "Plantar" },
    { key: "abdominal", label: "Abdominal" },
  ];

  const additional: { key: keyof ReflexExamData; label: string }[] = [
    { key: "clonus", label: "Clonus" },
    { key: "hoffmann", label: "Hoffmann's Sign" },
  ];

  return (
    <div className="reflex-examination-display space-y-3">
      <ConsultationTable
        title="Deep Tendon Reflexes (0-4+ Scale)"
        headers={["REFLEX", "R", "L"]}
        rows={deepTendon}
        data={data}
      />
      <ConsultationTable
        title="Superficial Reflexes"
        headers={["REFLEX", "R", "L"]}
        rows={superficial}
        data={data}
      />

      <div className="space-y-2">
        {additional.map((field) => {
          const val = data[field.key];
          if (!val) return null;
          return (
            <div key={field.key} className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">{field.label}:</span>
              <span>{val}</span>
            </div>
          );
        })}
        {data.notes && (
          <div className="space-y-1">
            <div className="text-gray-700 font-semibold">Additional Notes</div>
            <div className="text-gray-700">{data.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TabularEyeExaminationDisplay: React.FC<{
  data: TabularEyeValue;
}> = ({ data }) => {
  const allEyeExaminations = [
    // Visual Function Tests
    { key: "visual_acuity", label: "Visual Acuity" },
    { key: "refraction", label: "Refraction" },

    // Anterior Segment Examination
    { key: "extraocular_movements", label: "Extraocular Movements" },
    { key: "pupil_examination", label: "Pupil" },
    { key: "lids", label: "Lids" },
    { key: "iris", label: "Iris" },
    { key: "lens", label: "Lens" },
    { key: "intraocular_pressure", label: "Intraocular Pressure" },

    // Posterior Segment Examination
    { key: "fundus_exam", label: "Fundus Examination" },
  ];

  return (
    <div className="tabular-eye-examination-display space-y-3">
      <ConsultationTable
        title=""
        headers={["EXAMINATION", "Right", "Left"]}
        rows={allEyeExaminations}
        data={data}
      />

      {data.notes && (
        <div className="space-y-1">
          <div className="text-gray-700 font-semibold">Additional Notes</div>
          <div className="text-gray-700">{data.notes}</div>
        </div>
      )}
    </div>
  );
};

// --- Main Switch Export ---

export const FieldValueRenderer: React.FC<{
  fieldName: string;
  value: FieldValue | unknown;
}> = ({ fieldName, value }) => {
  if (!value) return null;

  // Type Guard: Prescriptions
  if (fieldName === "prescriptions" && Array.isArray(value)) {
    return <PrescriptionList value={value as PrescriptionMedication[]} />;
  }

  // Type Guard: Objects
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    // We cast to Unknown Record to check for existence of keys
    const fieldData = value as Record<string, unknown>;

    // Type Logic: Vitals
    if (
      "temperature" in fieldData ||
      "pulse" in fieldData ||
      "blood_pressure_systolic" in fieldData
    ) {
      return <VitalSignsDisplay data={fieldData as VitalSignsData} />;
    }
    // Type Logic: Eye
    if ("left" in fieldData || "right" in fieldData) {
      // Small edge case: Motor/Reflex also have left/right keys.
      // Vitals/Eye are distinct, but we should ensure we don't accidentally render Neuro data as Eye data
      // if the data shapes overlap. However, based on schema, Eye data usually just has 'left', 'right', 'notes'.
      // Motor has 'shoulder_left', etc.
      // Better specific check:
      const keys = Object.keys(fieldData);
      const isEye = keys.some((k) => k === "left" || k === "right");
      const isNeuro = keys.some(
        (k) => k.includes("_left") || k.includes("_right")
      );

      if (isEye && !isNeuro) {
        return <EyeFieldDisplay data={fieldData as EyeData} />;
      }
    }
    // Type Logic: Motor
    if ("shoulder_left" in fieldData || "shoulder_right" in fieldData) {
      return <MotorExaminationDisplay data={fieldData as MotorExamData} />;
    }
    // Type Logic: Reflex
    if ("biceps_left" in fieldData || "biceps_right" in fieldData) {
      return <ReflexExaminationDisplay data={fieldData as ReflexExamData} />;
    }
    // Type Logic: Tabular Eye
    if (
      "visual_acuity_left" in fieldData ||
      "visual_acuity_right" in fieldData
    ) {
      return (
        <TabularEyeExaminationDisplay data={fieldData as TabularEyeValue} />
      );
    }

    try {
      const stringified = JSON.stringify(value);
      return stringified.length < 200 ? (
        <span className="text-gray-700">{stringified}</span>
      ) : (
        <span className="text-gray-500 italic">[Complex data]</span>
      );
    } catch {
      return <span className="text-gray-500 italic">[Complex data]</span>;
    }
  }

  // Type Guard: String
  if (typeof value === "string") {
    const lines = value.split("\n").filter((line) => line.trim());
    if (lines.length <= 1)
      return <span className="text-gray-700">{value}</span>;
    return (
      <div className="text-gray-700">
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line}
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-gray-700">{String(value)}</span>;
};
