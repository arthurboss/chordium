import React from "react";

interface ToggleOptionProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const CheckIcon = ({ color = "white" }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ToggleOption: React.FC<ToggleOptionProps> = ({ active, onClick, icon, label }) => (
    <button type="button" className="flex items-center gap-2 cursor-pointer bg-transparent border-0 p-0 text-left" onClick={onClick}>
      <div className={`h-5 w-5 rounded border flex items-center justify-center ${active ? "border-primary" : "border-input"}`}>
        {active && <CheckIcon color="hsl(var(--primary))" />}
      </div>
      {icon}
      <span className="text-xs text-foreground">{label}</span>
    </button>
  );

export default ToggleOption;
