
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-md border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🧠</span>
          <h3 className="text-lg font-medium text-purple-800">Neurology Examination</h3>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="neurological_exam" className="text-purple-700">General Neurological Exam</Label>
            <textarea
              id="neurological_exam"
              name="neurological_exam"
              value={data.neurological_exam}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="Overall neurological examination findings"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="motor_function" className="text-purple-700">Motor Function</Label>
            <textarea
              id="motor_function"
              name="motor_function"
              value={data.motor_function}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="Strength, tone, and movement assessment"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sensory_function" className="text-purple-700">Sensory Function</Label>
            <textarea
              id="sensory_function"
              name="sensory_function"
              value={data.sensory_function}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="Pain, temperature, touch, and proprioception assessment"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reflexes" className="text-purple-700">Reflexes</Label>
            <textarea
              id="reflexes"
              name="reflexes"
              value={data.reflexes}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="Deep tendon and pathological reflex findings"
            />
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coordination" className="text-purple-700">Coordination & Cerebellar Function</Label>
            <textarea
              id="coordination"
              name="coordination"
              value={data.coordination}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="Coordination and cerebellar function tests"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cognitive_assessment" className="text-purple-700">Cognitive Assessment</Label>
            <textarea
              id="cognitive_assessment"
              name="cognitive_assessment"
              value={data.cognitive_assessment}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="Mental status, orientation, memory, and language assessment"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scan_results" className="text-purple-700">Imaging & Diagnostic Results</Label>
            <textarea
              id="scan_results"
              name="scan_results"
              value={data.scan_results}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-purple-200 rounded-md focus:border-purple-400 focus:ring focus:ring-purple-300 focus:ring-opacity-50"
              placeholder="CT, MRI, EEG, or other neuroimaging findings"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
