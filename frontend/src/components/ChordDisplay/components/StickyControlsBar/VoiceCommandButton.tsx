import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceCommandButtonProps {
  isListening: boolean;
  onToggle: () => void;
  size?: number;
  className?: string;
}

export function VoiceCommandButton({
  isListening,
  onToggle,
  size = 20,
  className = '',
}: VoiceCommandButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      className={`h-10 w-10 rounded-full ${
        isListening ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''
      } ${className}`}
      title={isListening ? 'Stop listening for voice commands' : 'Start listening for voice commands'}
    >
      <Mic size={size} />
    </Button>
  );
}
