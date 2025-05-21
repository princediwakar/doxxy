
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OphthalmologyFormProps {
  data: {
    visual_acuity_right: string;
    visual_acuity_left: string;
    intraocular_pressure_right: string;
    intraocular_pressure_left: string;
    eye_examination: string;
    fundoscopy: string;
    color_vision: string;
    peripheral_vision: string;
  };
  setData: (data: any) => void;
}

export function OphthalmologyForm({ data, setData }: OphthalmologyFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-green-50 p-4 rounded-md border border-teal-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">👁️</span>
          <h3 className="text-lg font-medium text-teal-800">Ophthalmology Examination</h3>
        </div>

        <div className="bg-white p-3 rounded-md border border-teal-100 mb-4">
          <h4 className="text-sm font-medium text-teal-700 mb-3">Visual Acuity</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visual_acuity_right" className="text-teal-700">Right Eye (OD)</Label>
              <input
                id="visual_acuity_right"
                name="visual_acuity_right"
                value={data.visual_acuity_right}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
                placeholder="e.g., 20/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="visual_acuity_left" className="text-teal-700">Left Eye (OS)</Label>
              <input
                id="visual_acuity_left"
                name="visual_acuity_left"
                value={data.visual_acuity_left}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
                placeholder="e.g., 20/20"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-md border border-teal-100 mb-4">
          <h4 className="text-sm font-medium text-teal-700 mb-3">Intraocular Pressure</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intraocular_pressure_right" className="text-teal-700">Right Eye (OD)</Label>
              <input
                id="intraocular_pressure_right"
                name="intraocular_pressure_right"
                value={data.intraocular_pressure_right}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
                placeholder="e.g., 16 mmHg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="intraocular_pressure_left" className="text-teal-700">Left Eye (OS)</Label>
              <input
                id="intraocular_pressure_left"
                name="intraocular_pressure_left"
                value={data.intraocular_pressure_left}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
                placeholder="e.g., 16 mmHg"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eye_examination" className="text-teal-700">External Eye Examination</Label>
            <textarea
              id="eye_examination"
              name="eye_examination"
              value={data.eye_examination}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
              placeholder="External eye structure examination findings"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fundoscopy" className="text-teal-700">Fundoscopy Results</Label>
            <textarea
              id="fundoscopy"
              name="fundoscopy"
              value={data.fundoscopy}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
              placeholder="Findings from eye fundus examination"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="color_vision" className="text-teal-700">Color Vision</Label>
            <textarea
              id="color_vision"
              name="color_vision"
              value={data.color_vision}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
              placeholder="Color vision test results"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="peripheral_vision" className="text-teal-700">Peripheral Vision</Label>
            <textarea
              id="peripheral_vision"
              name="peripheral_vision"
              value={data.peripheral_vision}
              onChange={handleChange}
              className="w-full h-24 px-3 py-2 border border-teal-200 rounded-md focus:border-teal-400 focus:ring focus:ring-teal-300 focus:ring-opacity-50"
              placeholder="Visual field test results"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
