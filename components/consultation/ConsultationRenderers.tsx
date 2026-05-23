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
} from "@/types/consultation";
import { isBlank } from "@/lib/schemaUtils";

// --- Helper: Neuro Table (Shared by Motor & Reflex) ---

interface ConsultationTableProps {
  title: string;
  headers: string[];
  rows: { key: string; label: string }[];
  // Accepts motor, reflex, or tabular eye data
  data: MotorExamData | ReflexExamData | TabularEyeValue;
  // Default value logic: 5 for motor, 2 for reflexes
  defaultValue: string;
}

const ConsultationTable: React.FC<ConsultationTableProps> = ({
  title,
  headers,
  rows,
  data,
  defaultValue,
}) => {
  // Cast to Record<string, string> to allow dynamic access (e.g., `${row.key}_left`)
  // This is safe because we know the structure matches the logic below
  const safeData = data as unknown as Record<string, string | null>;

  // Helper function to get value with default
  const getValueWithDefault = (value: unknown): string => {
    if (isBlank(value)) {
      return defaultValue || '';
    }
    return String(value);
  };

  // Motor and reflex tables always show (they have meaningful defaults)
  const alwaysShow = defaultValue === '5' || defaultValue === '2';
  if (!alwaysShow) {
    const hasData = rows.some(
      (row) => {
        const left = getValueWithDefault(safeData[`${row.key}_left`]);
        const right = getValueWithDefault(safeData[`${row.key}_right`]);
        return left !== '' || right !== '';
      }
    );
    if (!hasData && defaultValue === '') return null;
  }

  return (
    <div className="space-y-1">
      <div className="text-foreground font-semibold text-xs">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-auto border-collapse text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-0.5 px-1 bg-muted font-medium">
                {headers[0]}
              </th>
              <th className="text-left py-0.5 px-1 bg-muted font-medium">
                {headers[1]}
              </th>
              <th className="text-left py-0.5 px-1 bg-muted font-medium">
                {headers[2]}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const left = getValueWithDefault(safeData[`${row.key}_left`]);
              const right = getValueWithDefault(safeData[`${row.key}_right`]);

              if (left === '' && right === '') return null;

              return (
                <tr
                  key={row.key}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted"}
                >
                  <td className="py-0.5 px-1 border-b border-border">
                    {row.label}
                  </td>
                  <td className="py-0.5 px-1 border-b border-border">
                    {right !== '' ? right : "-"}
                  </td>
                  <td className="py-0.5 px-1 border-b border-border">
                    {left !== '' ? left : "-"}
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

// --- Shared Sub-Components ---

const AdditionalNotes: React.FC<{ notes: string | null }> = ({ notes }) => {
  if (!notes) return null;
  return (
    <div className="space-y-1">
      <div className="text-foreground font-semibold">Additional Notes</div>
      <div className="text-foreground">{notes}</div>
    </div>
  );
};

interface AdditionalFieldItem {
  key: string;
  label: string;
}


const AdditionalFields: React.FC<{
  fields: AdditionalFieldItem[];
  data: Record<string, unknown>;
}> = ({ fields, data }) => (
  <>
    {fields.map((field) => {
      const val = data[field.key];
      if (isBlank(val)) return null; // Use isBlank here
      return (
        <div key={field.key} className="flex items-center gap-2">
          <span className="text-foreground font-medium">{field.label}:</span>
          <span>{String(val)}</span>
        </div>
      );
    })}
  </>
);

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
            <tr className="border-b border-border">
              <th className="text-left py-1 px-2 bg-muted">Medicine</th>
              <th className="text-left py-1 px-2 bg-muted">Dosage</th>
              <th className="text-left py-1 px-2 bg-muted">Frequency</th>
              <th className="text-left py-1 px-2 bg-muted">Duration</th>
              <th className="text-left py-1 px-2 bg-muted">Instructions</th>
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
    value: string | undefined | null,
    unit: string = ""
  ) => {
    if (!value || value === "null") return null;
    return (
      <div key={label} className="flex items-center gap-1">
        <span className="text-foreground font-medium text-sm">{label}:</span>
        <span className="text-sm">
          {value} {unit}
        </span>
      </div>
    );
  };

  const items = [];
  if (data.temperature && data.temperature !== "null") items.push(renderItem("Temp", data.temperature, "°C"));
  if (data.pulse && data.pulse !== "null") items.push(renderItem("Pulse", data.pulse, "bpm"));
  if (data.blood_pressure_systolic || data.blood_pressure_diastolic) {
    const bpParts = [
      data.blood_pressure_systolic,
      data.blood_pressure_diastolic,
    ].filter((v) => v && v !== "null");
    if (bpParts.length > 0) {
      items.push(
        <div key="bp" className="flex items-center gap-1">
          <span className="text-foreground font-medium text-sm">B.P.:</span>
          <span className="text-sm">
            {bpParts.join("/")} mmHg
          </span>
        </div>
      );
    }
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
              <div className="text-foreground font-semibold text-sm min-w-[40px] pt-0.5">
                Left:
              </div>
              <div className="whitespace-pre-wrap">{data.left}</div>
            </div>
          )}
          {data.right && (
            <div className="flex items-start gap-2">
              <div className="text-foreground font-semibold text-sm min-w-[40px] pt-0.5">
                Right:
              </div>
              <div className="whitespace-pre-wrap">{data.right}</div>
            </div>
          )}
        </div>
      )}
      <AdditionalNotes notes={data.notes} />
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
  ];

  return (
    <div className="motor-examination-display space-y-3">
      <ConsultationTable
        title="Muscle Strength (0-5 Scale)"
        headers={["POWER", "R", "L"]}
        rows={muscleGroups}
        data={data}
        defaultValue="5"
      />

      <div className="space-y-2">
        <AdditionalFields fields={additionalFields} data={data as unknown as Record<string, unknown>} />
        <AdditionalNotes notes={data.notes} />
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
        defaultValue="2"
      />
      <ConsultationTable
        title="Superficial Reflexes"
        headers={["REFLEX", "R", "L"]}
        rows={superficial}
        data={data}
        defaultValue=""
      />

      <div className="space-y-2">
        <AdditionalFields fields={additional} data={data as unknown as Record<string, unknown>} />
        <AdditionalNotes notes={data.notes} />
      </div>
    </div>
  );
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

export const TabularEyeExaminationDisplay: React.FC<{
  data: TabularEyeValue;
}> = ({ data }) => {
  return (
    <div className="tabular-eye-examination-display space-y-3">
      <ConsultationTable
        title=""
        headers={["EXAMINATION", "Right", "Left"]}
        rows={allEyeExaminations}
        data={data}
        defaultValue=""
      />

      <AdditionalNotes notes={data.notes} />
    </div>
  );
};

// --- Main Switch Export ---

export const FieldValueRenderer: React.FC<{
  fieldName: string;
  value: FieldValue | unknown;
}> = ({ fieldName, value }) => {
  if (!value) return null;

  // 1. Prescriptions
  if (fieldName === "prescriptions" && Array.isArray(value)) {
    const validPrescriptions = (value as PrescriptionMedication[]).filter(
      (med) => med.name && med.name.trim().length > 0
    );
    if (validPrescriptions.length === 0) return null;
    return <PrescriptionList value={value as PrescriptionMedication[]} />;
  }

  // 2. Objects (Tables & Structured Data)
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const data = value as unknown as Record<string, unknown>;

    if (Object.keys(data).length === 0) return null;

    // Route strictly by fieldName instead of guessing the shape
    switch (fieldName) {
      case "vital_signs":
        return <VitalSignsDisplay data={value as VitalSignsData} />;
      case "eye_examination":
        return <TabularEyeExaminationDisplay data={value as TabularEyeValue} />;
      case "motor_examination":
        return <MotorExaminationDisplay data={value as MotorExamData} />;
      case "reflexes":
        return <ReflexExaminationDisplay data={value as ReflexExamData} />;
    }

    // Fallback for unhandled object types
    try {
      const stringified = JSON.stringify(value);
      return stringified.length < 200 ? (
        <span className="text-foreground">{stringified}</span>
      ) : (
        <span className="text-muted-foreground italic">[Complex data]</span>
      );
    } catch {
      return <span className="text-muted-foreground italic">[Complex data]</span>;
    }
  }

  // 3. String arrays (e.g., additional_clinical_findings)
  if (Array.isArray(value) && value.every((item): item is string => typeof item === 'string')) {
    const items = value.filter(s => s.trim().length > 0);
    if (items.length === 0) return null;
    return (
      <ul className="list-disc list-inside space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-foreground">{item}</li>
        ))}
      </ul>
    );
  }

  // 4. Standard Strings
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return null;

    const lines = trimmedValue.split("\n").filter((line) => line.trim());
    if (lines.length <= 1) return <span className="text-foreground">{trimmedValue}</span>;

    return (
      <div className="text-foreground">
        {lines.map((line, index) => (
          <div key={index} className="mb-1">
            {line}
          </div>
        ))}
      </div>
    );
  }

  // 5. Ultimate Fallback
  return <span className="text-foreground">{String(value)}</span>;
};
