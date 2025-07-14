// import React from "react";
// import { FormControl, FormField, FormItem } from "@/components/ui/form";
// import { Textarea } from "@/components/ui/textarea";
// import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
// import { Badge } from "@/components/ui/badge";
// import { ClipboardList, History, Stethoscope } from "lucide-react";
// import { FieldSection, NoteFieldConfig } from "@/lib/consultationNotesSchemas";
// import { ConsultationFormValues } from "@/hooks/consultation/useConsultation";
// import { Control } from "react-hook-form";

// // Section icons mapping
// const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
//   "History": History,
//   "Examination": Stethoscope,
//   "Assessment & Plan": ClipboardList,
//   "Investigations": ClipboardList,
// };

// type CombinedSpecialtyKeys = string; // Simplified for now

// interface ConsultationFormSectionProps {
//   section: FieldSection;
//   index: number;
//   control: Control<ConsultationFormValues>;
// }

// export const ConsultationFormSection: React.FC<ConsultationFormSectionProps> = ({
//   section,
//   index,
//   control,
// }) => {
//   const SectionIcon = sectionIcons[section.title] || ClipboardList;

//   return (
//     <div
//       className={`border-2 rounded-lg p-3 sm:p-4 shadow-sm ${
//         index % 2 === 0 ? 'bg-background' : 'bg-muted'
//       }`}
//     >
//       <div className="flex items-center gap-2 mb-3">
//         <SectionIcon className="h-4 w-4 text-primary" />
//         <h2 className="text-sm sm:text-base font-semibold text-primary">
//           {section.title}
//         </h2>
//       </div>
      
//       <Accordion type="single" collapsible className="w-full">
//         {section.fields.map((fieldConfig) => {
//           const isRequired = ['chief_complaint', 'assessment'].includes(fieldConfig.name as string);
          
//           return (
//             <AccordionItem key={fieldConfig.name as string} value={fieldConfig.name as string}>
//               <AccordionTrigger className="text-xs sm:text-sm text-foreground hover:no-underline">
//                 <div className="flex items-center gap-2">
//                   <span>{fieldConfig.label}</span>
//                   {isRequired && <span className="text-destructive text-xs">*</span>}
//                 </div>
//               </AccordionTrigger>
//               <AccordionContent className="pt-2">
//                 <FormField
//                   control={control}
//                   name={`specialty_data.${fieldConfig.name}` as `specialty_data.${CombinedSpecialtyKeys}`}
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormControl>
//                         {fieldConfig.type === 'textarea' ? (
//                           <Textarea
//                             {...field}
//                             value={(field.value as string | null | undefined) || ''}
//                             rows={fieldConfig.rows}
//                             placeholder={fieldConfig.placeholder}
//                             className={`text-xs sm:text-sm ${
//                               isRequired ? 'border-2 border-primary bg-primary/5' : 'border-input'
//                             }`}
//                             aria-label={fieldConfig.label}
//                           />
//                         ) : (
//                           <input
//                             {...field}
//                             type={fieldConfig.type}
//                             placeholder={fieldConfig.placeholder}
//                             className={`text-xs sm:text-sm ${
//                               isRequired ? 'border-2 border-primary bg-primary/5' : 'border-input'
//                             }`}
//                             aria-label={fieldConfig.label}
//                           />
//                         )}
//                       </FormControl>
//                     </FormItem>
//                   )}
//                 />
//               </AccordionContent>
//             </AccordionItem>
//           );
//         })}
//       </Accordion>
//     </div>
//   );
// }; 