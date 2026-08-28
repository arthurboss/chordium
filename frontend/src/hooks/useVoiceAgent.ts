import { useCallback, useRef, useState } from 'react';
import { parseCommand, type VoiceCommand } from '@/services/voice-commands/parse-command';
import { isWakeWord } from '@/services/voice-commands/wake-word-detector';
import { useVoiceSearch, type VoiceSearchState } from './useVoiceSearch';

export type VoiceAgentState = 'idle' | 'listening' | 'wake-detected' | 'processing' | 'error';

interface UseVoiceAgentOptions {
  onCommand: (command: VoiceCommand) => void | Promise<void>;
}

export function useVoiceAgent({ onCommand }: UseVoiceAgentOptions) {
  const [state, setState] = useState<VoiceAgentState>('idle');
  const [error, setError] = useState<string | null>(null);
  const wakeDetectedRef = useRef(false);

  const handleTranscript = useCallback(
    async (transcript: string) => {
      if (!wakeDetectedRef.current) {
        if (isWakeWord(transcript)) {
          wakeDetectedRef.current = true;
          setState('wake-detected');
        }
        return;
      }

      wakeDetectedRef.current = false;
      setState('processing');
      setError(null);

      const command = parseCommand(transcript);

      try {
        await onCommand(command);
        setState('idle');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Command failed');
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      }
    },
    [onCommand]
  );

  const voice = useVoiceSearch({ onTranscript: handleTranscript });

  const isActive = state !== 'idle';

  return {
    state,
    error,
    isActive,
    isListening: voice.state === 'listening',
    voiceState: voice.state,
  };
}
