const DEPARTMENT_MAP: Record<string, string> = {
  Ophthalmology: "Ophthalmology",
  Neurology: "Neurology",
  Cardiology: "Cardiology",
  Dermatology: "Dermatology",
  Orthopedics: "Orthopedics",
  Psychiatry: "Psychiatry",
  Pediatrics: "Pediatrics",
  ENT: "ENT",
  Gynecology: "Gynecology",
  Pulmonology: "Pulmonology",
  Dental: "Dental",
  "General Medicine": "General",
};

export const mapDepartmentName = (name: string): string =>
  DEPARTMENT_MAP[name] || "General";

// Character limits for different field types
export const CHARACTER_LIMITS = {
  textarea: {
    default: 5000
  },
  input: {
    default: 200,
  },
  prescription: {
    name: 100,
    dosage: 50,
    duration: 50,
    instructions: 500,
  }
}; 