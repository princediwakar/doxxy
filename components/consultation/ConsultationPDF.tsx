// components/consultation/ConsultationPDF.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { specialtyFieldSections } from '@/lib/consultationNotesSchemas';
import type { FieldValue, ClinicInfo, DoctorInfo, MotorExamData, ReflexExamData, TabularEyeValue, VitalSignsData, PrescriptionMedication } from '@/types/consultation';
import type { DbAppointment, DbPatient } from '@/types/core';
import { isBlank } from '@/lib/schemaUtils';
import { allEyeExaminations } from './ConsultationRenderers';


// ---------------------------------------------------------------------------
// 1. STYLESHEET - Tuned for Human Readability
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Base font bumped from 10 to 11
  page: { paddingTop: 35, paddingBottom: 35, paddingHorizontal: 35, fontFamily: 'Helvetica', fontSize: 11, color: '#374151' },
  
  // Headings scaled up to establish visual hierarchy without relying on squinting
  h1: { fontSize: 20, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4, color: '#111827' },
  h2: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  h3: { fontSize: 14, fontWeight: 'bold', color: '#111827', marginTop: 12, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 },
  
  // Hierarchy: labels dominate, values recede — no equal-weight ambiguity
  fieldContainer: { marginBottom: 10 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#111827', marginBottom: 2 },
  value: { fontSize: 11, color: '#374151', lineHeight: 1.4 },
  muted: { fontSize: 10, color: '#6B7280' },
  
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 10, marginBottom: 12 },
  clinicBlock: { width: '50%' },
  doctorBlock: { width: '45%', alignItems: 'flex-end' },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  colFull: { width: '100%' },
  colHalf: { width: '48.5%' },
  colThird: { width: '31.5%' },
  
  // Tables: The 7pt and 8pt fonts are gone. Minimum is now 10pt. 
  tableContainer: { width: '100%', marginBottom: 8 },
  tableTitle: { fontSize: 11, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  table: { width: '100%', borderStyle: 'solid', borderWidth: 1, borderColor: '#E5E7EB' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  // Headers bumped from 7 to 10
  tableColHeader: { padding: 4, fontSize: 10, fontWeight: 'bold', color: '#111827' },
  // Data bumped from 8 to 11
  tableCol: { padding: 4, fontSize: 11, color: '#374151' },
  
  // Chips and Sub-notes
  subDataRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 8 },
  subDataItem: { flexDirection: 'row', alignItems: 'flex-start', marginRight: 8, marginBottom: 2 },
  subDataLabel: { fontSize: 10, fontWeight: 'bold', color: '#111827', marginRight: 4 },
  subDataValue: { fontSize: 11, color: '#374151' },
  notesContainer: { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  
  footer: { marginTop: 24, borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12 }
});
// ---------------------------------------------------------------------------
// 2. DATA MUTATION LOGIC (Ported exactly from your HTML Utils)
// ---------------------------------------------------------------------------
const populateDefaultValues = (fieldName: string, value: any) => {
  if (!value) {
    if (fieldName === 'motor_examination') {
      return { shoulder_left: '5', shoulder_right: '5', elbow_left: '5', elbow_right: '5', wrist_left: '5', wrist_right: '5', hip_left: '5', hip_right: '5', knee_left: '5', knee_right: '5', ankle_left: '5', ankle_right: '5', muscle_tone: null, muscle_bulk: null, involuntary_movements: null, notes: null };
    }
    if (fieldName === 'reflexes') {
      return { biceps_left: '2', biceps_right: '2', triceps_left: '2', triceps_right: '2', supinator_left: '2', supinator_right: '2', knee_left: '2', knee_right: '2', ankle_left: '2', ankle_right: '2', plantar_right: null, plantar_left: null, abdominal_left: null, abdominal_right: null, clonus: null, hoffmann: null, notes: null };
    }
  }
  return value;
};

// ---------------------------------------------------------------------------
// 3. LAYOUT ENGINE (Ported exactly from your HTML Utils)
// ---------------------------------------------------------------------------
const isFieldFullWidth = (field: any, value: any): boolean => {
  if (['chief_complaint', 'history_of_present_illness', 'diagnosis', 'treatment', 'planned_investigations', 'management'].includes(field.name)) return true;
  if (['vital_signs', 'prescription', 'tabular_eye'].includes(field.type)) return true;
  if (typeof value === 'string' && value.length > 300) return true;
  if (field.type === 'textarea' && typeof value === 'string' && value.length <= 150) return false;
  if (['motor_examination', 'reflex_examination'].includes(field.type)) return false;
  return false;
};

const shouldStartNewGroup = (field: any, currentGroup: any[]): boolean => {
  if (currentGroup.length === 0) return false;
  if (currentGroup[0].type !== field.type) {
    const currentIsExam = ['motor_examination', 'reflex_examination'].includes(currentGroup[0].type);
    const newIsExam = ['motor_examination', 'reflex_examination'].includes(field.type);
    if (currentIsExam && newIsExam) return false;
    if (currentGroup[0].type === 'textarea' && field.type === 'textarea') return false;
    return true;
  }
  const currentIsCompact = ['reflex_examination', 'motor_examination', 'tabular_eye'].includes(currentGroup[0].type);
  const newIsCompact = ['reflex_examination', 'motor_examination', 'tabular_eye'].includes(field.type);
  if (currentIsCompact !== newIsCompact) return true;
  return false;
};

// ---------------------------------------------------------------------------
// 4. RENDERERS
// ---------------------------------------------------------------------------
const PDFTable = ({ title, headers, rows, flexWidths }: { title?: string, headers: string[], rows: (string | null | undefined)[][], flexWidths: number[] }) => {
  if (rows.length === 0) return null;
  return (
    <View style={styles.tableContainer}>
      {title && <Text style={styles.tableTitle}>{title}</Text>}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {headers.map((h, i) => <View key={i} style={{ flex: flexWidths[i] }}><Text style={styles.tableColHeader}>{h}</Text></View>)}
        </View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.tableRow, rowIndex % 2 === 0 ? { backgroundColor: '#FFFFFF' } : { backgroundColor: '#F9FAFB' }]}>
            {row.map((cell, cellIndex) => (
              <View key={cellIndex} style={{ flex: flexWidths[cellIndex] }}>
                <Text style={styles.tableCol}>{cell && cell !== 'null' ? cell : '-'}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const RenderNeuroTable = ({ title, headers, rowsConfig, data, defaultValue }: any) => {
  const rows = rowsConfig.map((c: any) => {
    const r = isBlank(data[`${c.key}_right`]) ? defaultValue : String(data[`${c.key}_right`]);
    const l = isBlank(data[`${c.key}_left`]) ? defaultValue : String(data[`${c.key}_left`]);
    return [c.label, r, l];
  });

  // Replicating HTML Logic: Only show rows with data if it doesn't have a default
  const alwaysShow = defaultValue === '5' || defaultValue === '2';
  const finalRows = alwaysShow ? rows : rows.filter((r: any) => r[1] !== '' || r[2] !== '');

  if (finalRows.length === 0 && defaultValue === '') return null;
  return <PDFTable title={title} headers={headers} rows={finalRows} flexWidths={[2, 1, 1]} />;
};

const AdditionalNotes = ({ notes }: { notes?: string | null }) => {
  if (!notes) return null;
  return (
    <View style={styles.notesContainer}>
      <Text style={styles.subDataLabel}>Additional Notes:</Text>
      <Text style={styles.value}>{notes}</Text>
    </View>
  );
};

// --- Specific Field Renderers ---

const RenderMotorExam = ({ data }: { data: MotorExamData }) => {
  const muscles = [{ key: "shoulder", label: "Shoulder" }, { key: "elbow", label: "Elbow" }, { key: "wrist", label: "Wrist" }, { key: "hip", label: "Hip" }, { key: "knee", label: "Knee" }, { key: "ankle", label: "Ankle" }];
  return (
    <View>
      <RenderNeuroTable title="Muscle Strength (0-5 Scale)" headers={['POWER', 'R', 'L']} rowsConfig={muscles} data={data} defaultValue="5" />
      <View style={styles.subDataRow}>
        {data.muscle_tone && <View style={styles.subDataItem}><Text style={styles.subDataLabel}>Tone:</Text><Text style={styles.subDataValue}>{data.muscle_tone}</Text></View>}
        {data.muscle_bulk && <View style={styles.subDataItem}><Text style={styles.subDataLabel}>Bulk:</Text><Text style={styles.subDataValue}>{data.muscle_bulk}</Text></View>}
        {data.involuntary_movements && <View style={styles.subDataItem}><Text style={styles.subDataLabel}>Invol. Mvmts:</Text><Text style={styles.subDataValue}>{data.involuntary_movements}</Text></View>}
      </View>
      <AdditionalNotes notes={data.notes} />
    </View>
  );
};

const RenderReflexExam = ({ data }: { data: ReflexExamData }) => {
  const deep = [{ key: "biceps", label: "Biceps (B)" }, { key: "triceps", label: "Triceps (T)" }, { key: "supinator", label: "Supinator (S)" }, { key: "knee", label: "Knee (K)" }, { key: "ankle", label: "Ankle (A)" }];
  const superficial = [{ key: "plantar", label: "Plantar" }, { key: "abdominal", label: "Abdominal" }];
  return (
    <View>
      <RenderNeuroTable title="Deep Tendon Reflexes (0-4+)" headers={['REFLEX', 'R', 'L']} rowsConfig={deep} data={data} defaultValue="2" />
      <RenderNeuroTable title="Superficial Reflexes" headers={['REFLEX', 'R', 'L']} rowsConfig={superficial} data={data} defaultValue="" />
      <View style={styles.subDataRow}>
        {data.clonus && <View style={styles.subDataItem}><Text style={styles.subDataLabel}>Clonus:</Text><Text style={styles.subDataValue}>{data.clonus}</Text></View>}
        {data.hoffmann && <View style={styles.subDataItem}><Text style={styles.subDataLabel}>Hoffmann's:</Text><Text style={styles.subDataValue}>{data.hoffmann}</Text></View>}
      </View>
      <AdditionalNotes notes={data.notes} />
    </View>
  );
};

const RenderPrescriptions = ({ data }: { data: PrescriptionMedication[] }) => {
  const valid = data.filter(med => med.name && med.name.trim().length > 0);
  if (valid.length === 0) return null;
  const rows = valid.map(m => [m.name, m.dosage || '-', m.frequency || '-', m.duration || '-', m.instructions || '-']);
  return <PDFTable headers={['Medicine', 'Dosage', 'Freq', 'Duration', 'Instructions']} rows={rows} flexWidths={[2.5, 1.2, 1.2, 1.5, 2.5]} />;
};

const RenderVitalSigns = ({ data }: { data: VitalSignsData }) => {
  const items: { label: string; value: string }[] = [];
  if (data.temperature) items.push({ label: 'Temp', value: `${data.temperature} °C` });
  if (data.pulse) items.push({ label: 'Pulse', value: `${data.pulse} bpm` });
  if (data.blood_pressure_systolic || data.blood_pressure_diastolic) {
    const bp = [data.blood_pressure_systolic, data.blood_pressure_diastolic].filter(Boolean).join('/');
    if (bp) items.push({ label: 'B.P.', value: `${bp} mmHg` });
  }
  if (data.respiratory_rate) items.push({ label: 'Resp. Rate', value: `${data.respiratory_rate} /min` });
  if (data.oxygen_saturation) items.push({ label: 'O₂ Sat', value: `${data.oxygen_saturation} %` });
  if (data.height) items.push({ label: 'Height', value: `${data.height} cm` });
  if (data.weight) items.push({ label: 'Weight', value: `${data.weight} kg` });
  if (data.bmi) items.push({ label: 'BMI', value: data.bmi });
  if (items.length === 0) return null;
  return (
    <View style={styles.subDataRow}>
      {items.map((item, i) => (
        <View key={i} style={styles.subDataItem}>
          <Text style={styles.subDataLabel}>{item.label}:</Text>
          <Text style={styles.subDataValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
};

const RenderTabularEye = ({ data }: { data: TabularEyeValue }) => {
  const rows = allEyeExaminations
    .map((e) => {
      const r = data[`${e.key}_right` as keyof TabularEyeValue] as string | null | undefined;
      const l = data[`${e.key}_left` as keyof TabularEyeValue] as string | null | undefined;
      if (!r && !l) return null;
      return [e.label, r || '-', l || '-'];
    })
    .filter(Boolean) as string[][];
  if (rows.length === 0 && !data.notes) return null;
  return (
    <View>
      <PDFTable title="Eye Examination" headers={['EXAMINATION', 'Right', 'Left']} rows={rows} flexWidths={[2, 1, 1]} />
      <AdditionalNotes notes={data.notes} />
    </View>
  );
};

// ---------------------------------------------------------------------------
// 5. MAIN DOCUMENT COMPONENT
// ---------------------------------------------------------------------------

export const ConsultationPDF = ({ patient, appointment, clinicInfo, doctorInfo, consultationData, departmentType, showClinicHeader = true }: { patient?: any; appointment?: any; clinicInfo?: any; doctorInfo?: any; consultationData?: any; departmentType?: string; showClinicHeader?: boolean }) => {
  const sections = specialtyFieldSections[departmentType || 'General'] || specialtyFieldSections.General;

  const renderFieldValue = (field: any, value: any) => {
    if (field.name === 'prescriptions') return <RenderPrescriptions data={value} />;
    if (field.name === 'motor_examination') return <RenderMotorExam data={value} />;
    if (field.name === 'reflexes') return <RenderReflexExam data={value} />;
    if (field.name === 'vital_signs') return <RenderVitalSigns data={value} />;
    if (field.name === 'eye_examination') return <RenderTabularEye data={value} />;

    if (Array.isArray(value)) {
      return <View>{value.map((v: any, i: number) => <Text key={i} style={styles.value}>• {String(v)}</Text>)}</View>;
    }

    if (typeof value === 'object' && value !== null) {
      return <Text style={styles.muted}>[Complex data — see structured section]</Text>;
    }

    return <Text style={styles.value}>{String(value ?? '')}</Text>;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* CLINIC HEADER — shown for download; spacer preserved for letterhead printing */}
        {showClinicHeader ? (
          <View fixed style={styles.headerContainer}>
            <View style={styles.clinicBlock}>
              <Text style={styles.h1}>{clinicInfo?.name || 'CLINIC'}</Text>
              {clinicInfo?.address && <Text style={styles.muted}>{clinicInfo.address}</Text>}
              {clinicInfo?.phone && <Text style={styles.muted}>{clinicInfo.phone}</Text>}
            </View>
            <View style={styles.doctorBlock}>
              <Text style={styles.h2}>{doctorInfo?.name || 'Doctor'}</Text>
              <Text style={styles.label}>{doctorInfo?.specialization}</Text>
              {doctorInfo?.qualification && <Text style={styles.muted}>{doctorInfo.qualification}</Text>}
            </View>
          </View>
        ) : (
          <View style={{ height: 68 }} />
        )}

        {/* PATIENT INFORMATION — first-class section */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.h3}>PATIENT INFORMATION</Text>

          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.value}>
                <Text style={styles.label}>Name: </Text>
                {patient?.name || '—'}
              </Text>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.value}>
                <Text style={styles.label}>Age: </Text>
                {patient?.age ? `${patient.age} years` : '—'}{patient?.gender ? `, ${patient.gender}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.colHalf}>
              <Text style={styles.value}>
                <Text style={styles.label}>Address: </Text>
                {patient?.address || '—'}
              </Text>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.value}>
                <Text style={styles.label}>Medical ID: </Text>
                {patient?.medical_id || '—'}
              </Text>
            </View>
          </View>

          {appointment?.date ? (
            <View style={styles.row}>
              <View style={styles.colHalf}>
                <Text style={styles.value}>
                  <Text style={styles.label}>Appointment: </Text>
                  {new Date(appointment.date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.colHalf} />
            </View>
          ) : null}
        </View>

        {/* Separator */}
        <View style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB', marginBottom: 12 }} />

        {/* CONTENT */}
        {sections.map((section: any, sIdx: number) => {
          
          // 1. Filter Fields based on Populated Data (Mirroring HTML exactly)
          const fieldsWithContent = section.fields.filter((field: any) => {
            const val = populateDefaultValues(field.name, consultationData[field.name]);
            if (field.type === 'motor_examination' || field.name === 'reflexes') return true;
            if (isBlank(val)) return false;
            if (typeof val === 'string') return val.trim().length > 0;
            if (Array.isArray(val)) return val.length > 0;
            if (typeof val === 'object' && val !== null) {
              return Object.values(val).some((nestedVal: any) => 
                typeof nestedVal === 'string' && nestedVal.trim().length > 0
              );
            }
            return true;
          });

          if (fieldsWithContent.length === 0) return null;

          // 2. Group Fields (Mirroring HTML exactly)
          const groups: any[][] = [];
          let currentGroup: any[] = [];

          fieldsWithContent.forEach((field: any, index: number) => {
            const val = populateDefaultValues(field.name, consultationData[field.name]);
            const isFullWidthField = isFieldFullWidth(field, val);

            if (currentGroup.length === 3 || isFullWidthField || shouldStartNewGroup(field, currentGroup)) {
              if (currentGroup.length > 0) {
                groups.push([...currentGroup]);
                currentGroup = [];
              }
            }

            if (!isFullWidthField) currentGroup.push(field);
            else groups.push([field]);

            if (index === fieldsWithContent.length - 1 && currentGroup.length > 0) {
              groups.push([...currentGroup]);
            }
          });

          // 3. Render Groups
          return (
            <View key={sIdx} style={{ marginBottom: 12 }}>
              {section.title !== "History" && <Text style={styles.h3}>{section.title}</Text>}

              {groups.map((group, gIdx) => {
                const val0 = populateDefaultValues(group[0].name, consultationData[group[0].name]);

                if (group.length === 1 && isFieldFullWidth(group[0], val0)) {
                  return (
                    <View key={gIdx} wrap={false} style={[styles.row, { width: '100%' }]}>
                      <View style={styles.colFull}>
                        <Text style={styles.label}>{group[0].label}</Text>
                        {renderFieldValue(group[0], val0)}
                      </View>
                    </View>
                  );
                }

                return (
                  <View key={gIdx} wrap={false} style={styles.row}>
                    {group.map((f, i) => {
                      const val = populateDefaultValues(f.name, consultationData[f.name]);
                      return (
                        <View key={i} style={group.length === 3 ? styles.colThird : styles.colHalf}>
                          <Text style={styles.label}>{f.label}</Text>
                          {renderFieldValue(f, val)}
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* SIGNATURE FOOTER — flows naturally to final page */}
        <View style={styles.footer}>
          {doctorInfo?.signature && (() => {
            const lines = doctorInfo.signature.split('\n').filter((l: string) => l.trim() !== '');
            if (lines.length === 0) return null;
            const [name, ...credentials] = lines;
            // Fallback: if DB stored it as a single comma-separated string
            const hasImplicitBreaks = lines.length === 1 && name.includes(',');
            const creds = hasImplicitBreaks
              ? name.split(',').map((s: string) => s.trim()).filter(Boolean).slice(1)
              : credentials;

            return (
              <View style={{ alignItems: 'flex-start', width: '100%' }}>
                <View style={{ borderTopWidth: 1, borderTopColor: '#111827', paddingTop: 6, minWidth: 150 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827', textAlign: 'left' }}>
                    {hasImplicitBreaks ? name.split(',')[0].trim() : name}
                  </Text>
                  {creds.map((cred: string, idx: number) => (
                    <Text key={idx} style={{ fontSize: 9, color: '#4B5563', textAlign: 'left', marginTop: 2 }}>
                      {cred}
                    </Text>
                  ))}
                </View>
              </View>
            );
          })()}
        </View>

      </Page>
    </Document>
  );
};