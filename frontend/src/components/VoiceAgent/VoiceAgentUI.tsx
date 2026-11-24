import { Loader2, Volume2, AlertCircle } from 'lucide-react';

interface VoiceAgentUIProps {
  isActive: boolean;
  isListening: boolean;
  state: 'idle' | 'listening' | 'wake-detected' | 'processing' | 'error';
  error: string | null;
}

export function VoiceAgentUI({ isActive, isListening, state, error }: VoiceAgentUIProps) {
  if (!isActive) return null;

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 w-80">
      <div className="flex items-center gap-3">
        {isListening ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Listening...</span>
          </>
        ) : state === 'wake-detected' ? (
          <>
            <Volume2 className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Ready for command</span>
          </>
        ) : state === 'processing' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span className="text-sm font-medium">Processing...</span>
          </>
        ) : error ? (
          <>
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-600">{error}</span>
          </>
        ) : null}
      </div>

      {state === 'wake-detected' && (
        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
          Say your command now (e.g., "change key to G")
        </p>
      )}
    </div>
  );
}
