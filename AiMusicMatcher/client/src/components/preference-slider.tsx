import { useState } from "react";

interface PreferenceSliderProps {
  name: string;
  initialValue: number;
  leftLabel: string;
  rightLabel: string;
  onChange: (value: number) => void;
}

const PreferenceSlider = ({
  name,
  initialValue,
  leftLabel,
  rightLabel,
  onChange,
}: PreferenceSliderProps) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="preference-slider">
      <div className="flex justify-between mb-2">
        <span>{name}</span>
        <span className="text-primary font-medium">{value}/10</span>
      </div>
      <div className="relative">
        <div className="w-full h-2 bg-neutral-300 bg-opacity-30 rounded-full">
          <div
            className="absolute h-2 bg-primary rounded-full"
            style={{ width: `${value * 10}%` }}
          ></div>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={handleChange}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
          data-preference={name.toLowerCase()}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-300 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
};

export default PreferenceSlider;
