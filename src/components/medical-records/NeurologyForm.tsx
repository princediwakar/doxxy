
import { Label } from "@/components/ui/label";

interface NeurologyFormProps {
  data: {
    neurological_exam: string;
    motor_function: string;
    sensory_function: string;
    reflexes: string;
    coordination: string;
    cognitive_assessment: string;
    scan_results: string;
  };
  setData: (data: any) => void;
}

export function NeurologyForm({ data, setData }: NeurologyFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Neurology Examination</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="neurological_exam">General Neurological Exam</Label>
          <textarea
            id="neurological_exam"
            name="neurological_exam"
            value={data.neurological_exam}
            onChange={handleChange}
            className="w-full h-24 px-3 py-2 border rounded-md"
            placeholder="Overall neurological examination findings"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="motor_function">Motor Function</Label>
          <textarea
            id="motor_function"
            name="motor_function"
            value={data.motor_function}
            onChange={handleChange}
            className="w-full h-24 px-3 py-2 border rounded-md"
            placeholder="Strength, tone, and movement assessment"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sensory_function">Sensory Function</Label>
          <textarea
            id="sensory_function"
            name="sensory_function"
            value={data.sensory_function}
            onChange={handleChange}
            className="w-full h-24 px-3 py-2 border rounded-md"
            placeholder="Pain, temperature, touch, and proprioception assessment"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reflexes">Reflexes</Label>
          <textarea
            id="reflexes"
            name="reflexes"
            value={data.reflexes}
            onChange={handleChange}
            className="w-full h-24 px-3 py-2 border rounded-md"
            placeholder="Deep tendon and pathological reflex findings"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coordination">Coordination</Label>
        <textarea
          id="coordination"
          name="coordination"
          value={data.coordination}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border rounded-md"
          placeholder="Coordination and cerebellar function tests"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cognitive_assessment">Cognitive Assessment</Label>
        <textarea
          id="cognitive_assessment"
          name="cognitive_assessment"
          value={data.cognitive_assessment}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border rounded-md"
          placeholder="Mental status, orientation, memory, and language assessment"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="scan_results">Imaging Results</Label>
        <textarea
          id="scan_results"
          name="scan_results"
          value={data.scan_results}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border rounded-md"
          placeholder="CT, MRI, EEG, or other neuroimaging findings"
        />
      </div>
    </div>
  );
}
