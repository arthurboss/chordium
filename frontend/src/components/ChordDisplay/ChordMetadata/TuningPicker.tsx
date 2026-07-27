import React from "react";
import type { Note } from "@chordium/types";
import { NOTES } from "@/utils/chord-transposition";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
 */
const TuningPicker: React.FC<TuningPickerProps> = ({ value, onChange }) => {
  const strings = parseTuning(value);

  const handleStringChange = (index: number, note: string) => {
    const next = [...strings];
    next[index] = note;
    onChange(next.join("-"));
  };

  return (
    <div className="flex items-center gap-1">
      {strings.map((note, i) => (
        <Select
          key={i}
          value={note}
          onValueChange={(v) => handleStringChange(i, v)}
        >
          <SelectTrigger
            className="h-7 w-14 text-xs px-2"
            aria-label={`String ${6 - i}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
