import React from "react";

interface ToggleOptionProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ToggleOption: React.FC<ToggleOptionProps> = ({ active, onClick, icon, label }) => (
  <label className="flex items-center gap-2 cursor-pointer" onClick={onClick}>
    <div className={`h-5 w-5 rounded border flex items-center justify-center ${active ? "bg-primary border-primary" : "border-input"}`}>
      {active && <CheckIcon />}
    </div>
    {icon}
    <span className="text-xs text-foreground">{label}</span>
  </label>
);

export default ToggleOption;
