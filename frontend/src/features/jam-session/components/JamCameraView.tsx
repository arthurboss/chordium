import { Loader2 } from 'lucide-react';
import { RefObject } from 'react';

interface JamCameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  hasCamera: boolean;
}

export function JamCameraView({ videoRef, canvasRef, hasCamera }: JamCameraViewProps) {
  return (
    <div className="relative aspect-square w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${hasCamera ? '' : 'hidden'}`}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {!hasCamera && (
        <div className="w-full h-full flex items-center justify-center bg-gray-900">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
}
