
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Ophthalmology Examination</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="visual_acuity_right">Visual Acuity (Right)</Label>
          <Input
            id="visual_acuity_right"
            name="visual_acuity_right"
            value={data.visual_acuity_right}
            onChange={handleChange}
            placeholder="e.g., 20/20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="visual_acuity_left">Visual Acuity (Left)</Label>
          <Input
            id="visual_acuity_left"
            name="visual_acuity_left"
            value={data.visual_acuity_left}
            onChange={handleChange}
            placeholder="e.g., 20/20"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="intraocular_pressure_right">Intraocular Pressure (Right)</Label>
          <Input
            id="intraocular_pressure_right"
            name="intraocular_pressure_right"
            value={data.intraocular_pressure_right}
            onChange={handleChange}
            placeholder="e.g., 15 mmHg"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="intraocular_pressure_left">Intraocular Pressure (Left)</Label>
          <Input
            id="intraocular_pressure_left"
            name="intraocular_pressure_left"
            value={data.intraocular_pressure_left}
            onChange={handleChange}
            placeholder="e.g., 15 mmHg"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="eye_examination">External Eye Examination</Label>
        <textarea
          id="eye_examination"
          name="eye_examination"
          value={data.eye_examination}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border rounded-md"
          placeholder="Findings from external examination of the eye"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fundoscopy">Fundoscopy</Label>
        <textarea
          id="fundoscopy"
          name="fundoscopy"
          value={data.fundoscopy}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border rounded-md"
          placeholder="Retina, optic disc, macula, and vessels findings"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color_vision">Color Vision</Label>
          <textarea
            id="color_vision"
            name="color_vision"
            value={data.color_vision}
            onChange={handleChange}
            className="w-full h-24 px-3 py-2 border rounded-md"
            placeholder="Color vision test results"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="peripheral_vision">Peripheral Vision</Label>
          <textarea
            id="peripheral_vision"
            name="peripheral_vision"
            value={data.peripheral_vision}
            onChange={handleChange}
            className="w-full h-24 px-3 py-2 border rounded-md"
            placeholder="Visual field test results"
          />
        </div>
      </div>
    </div>
  );
}
