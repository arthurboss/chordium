import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import type { Note } from "@chordium/types";
import { NOTES } from "@/utils/chord-transposition";
import {
  Select,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { GUITAR_TUNINGS } from "@/constants/guitar-tunings";

const STANDARD = GUITAR_TUNINGS.STANDARD;

const FLAT_TO_SHARP: Record<string, Note> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

/** Normalizes a flat-spelled note to its sharp equivalent (dropdowns are sharp-only). */
function toSharp(note: string): string {
  return FLAT_TO_SHARP[note] ?? note;
}

interface TuningPickerProps {
  /** Hyphen-joined tuning string, low string first (e.g. "E-A-D-G-B-E"). */
  value: string;
  onChange: (value: string) => void;
}

function parseTuning(value: string): string[] {
  const notes = value.trim().split(/[-\s]+/).filter(Boolean);
  return Array.from({ length: 6 }, (_, i) => toSharp(notes[i] ?? STANDARD[i]));
}

/**
 * Six per-string note selectors, each constrained to the 12 chromatic notes.
 * Strings are ordered low (6th) to high (1st), matching GuitarTuning.
 * Each is a minimal borderless field showing just the note; click opens the dropdown.
 */
const TuningPicker: React.FC<TuningPickerProps> = ({ value, onChange }) => {
  const strings = parseTuning(value);

  const handleStringChange = (index: number, note: string) => {
    const next = [...strings];
    next[index] = note;
    onChange(next.join("-"));
  };

  return (
    <div className="flex items-center gap-0.5">
      {strings.map((note, i) => (
        <Select
          key={i}
          value={note}
          onValueChange={(v) => handleStringChange(i, v)}
        >
          <SelectPrimitive.Trigger
            aria-label={`String ${6 - i}`}
            className="inline-flex items-center justify-center w-8 h-6 rounded-md border border-input bg-background font-medium text-primary hover:bg-primary/10 focus:outline-hidden focus:ring-1 focus:ring-ring data-[state=open]:ring-1 data-[state=open]:ring-ring transition-colors"
          >
            <SelectPrimitive.Value />
          </SelectPrimitive.Trigger>
          <SelectContent className="min-w-[3rem]">
            {NOTES.map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
};

export default TuningPicker;
