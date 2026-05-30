import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useJamSession } from "../useJamSession";
import { toast } from "sonner";
import { Loader2, QrCode, ScanLine } from "lucide-react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";

export function ShareSession() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [scanMode, setScanMode] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  const {
    isHost,
    sessionId,
    connectedPeers,
    isConnected,
    startSession,
    joinSession,
    endSession,
    generateConnectionString,
    processConnectionString,
    peerId,
  } = useJamSession();

  const connectionString = generateConnectionString?.() || "";

  const handleConnect = async () => {
    if (!scanInput.trim()) return;

    try {
      setIsLoading(true);
      const success = processConnectionString?.(scanInput);
      if (success) {
        setScanMode(false);
        setScanInput("");
        toast.success(i18n.t("notifications:jamSessionJoined"));
      } else {
        toast.error(i18n.t("notifications:jamSessionInvalidString"));
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error(i18n.t("notifications:jamSessionJoinFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      setIsLoading(true);
      await startSession?.();
      toast.success(i18n.t("notifications:jamSessionStarted"));
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error(i18n.t("notifications:jamSessionStartFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(connectionString);
    toast.success(i18n.t("notifications:connectionStringCopied"));
  };

  useEffect(() => {
    if (scanMode) {
      const initCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false,
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            streamRef.current = stream;
            setHasCamera(true);
          }
        } catch (error) {
          console.error("Error accessing camera:", error);
          toast.error(i18n.t("notifications:cameraError"));
          setHasCamera(false);
        }
      };

      initCamera();

      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
    }
  }, [scanMode]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={async (open) => {
        setIsOpen(open);
        if (open && isHost && !isConnected) {
          await handleStartSession();
        }

        if (!open && streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setHasCamera(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={isConnected ? "default" : "outline"}
          className="h-10 w-10 rounded-full"
        >
          <ScanLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw_-_2rem)] sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {scanMode
              ? t("jamSession.joinSession")
              : isHost
              ? t("jamSession.shareSession")
              : t("jamSession.joinSession")}
            {isConnected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {t("jamSession.connected")}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {isConnected ? (
            <div className="w-full space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  {isHost ? t("jamSession.sessionActive") : t("jamSession.connectedToSession")}
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {isHost
                    ? t("jamSession.sharePeers", { count: connectedPeers.length })
                    : t("jamSession.connectedToHost")}
                </p>
              </div>

              {isHost && (
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <h4 className="font-medium mb-2">{t("jamSession.connectedPeers")}</h4>
                  {connectedPeers.length > 0 ? (
                    <ul className="space-y-2">
                      {connectedPeers.map((peerId) => (
                        <li key={peerId} className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                          <span className="text-sm">Peer: {peerId.substring(0, 8)}...</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t("jamSession.noPeers")}</p>
                  )}
                </div>
              )}

              <Button
                variant="destructive"
                className="w-full mt-4"
                onClick={() => {
                  endSession();
                  setIsOpen(false);
                }}
              >
                {t("jamSession.endSession")}
              </Button>
            </div>
          ) : scanMode ? (
            <>
              <div className="w-full space-y-4">
                <div className="relative aspect-square w-full max-w-md mx-auto bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover ${hasCamera ? '' : 'hidden'}`}
                  />
                  {!hasCamera && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                      <QrCode className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 border-4 border-primary-500 rounded-lg pointer-events-none" />
                </div>

                <div className="relative">
                  <Input
                    placeholder={t("jamSession.orPasteConnectionString")}
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    className="pr-10"
                  />
                  {scanInput && (
                    <button
                      onClick={() => setScanInput("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={handleConnect}
                  disabled={isLoading || !scanInput.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("jamSession.connecting")}
                    </>
                  ) : (
                    t("jamSession.connect")
                  )}
                </Button>
              </div>
              <Button variant="outline" onClick={() => setScanMode(false)}>
                {t("jamSession.back")}
              </Button>
            </>
          ) : isHost ? (
            <>
              <div className="w-full space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border flex flex-col items-center">
                  <QRCodeSVG
                    value={connectionString}
                    size={256}
                    level="H"
                    includeMargin={true}
                    className="mx-auto mb-4"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    <p>Peer ID: {peerId?.substring(0, 8)}...</p>
                    <p>Session ID: {sessionId?.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-center text-muted-foreground">
                    {t("jamSession.scanToJoin")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={connectionString}
                      readOnly
                      className="flex-1 text-xs font-mono"
                    />
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {t("jamSession.copy")}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Session ID: {sessionId?.substring(0, 8)}...
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={copyToClipboard}>
                {t("jamSession.copyConnectionString")}
              </Button>
            </>
          ) : (
            <div className="w-full space-y-4">
              <Button className="w-full" onClick={() => setScanMode(true)}>
                {t("jamSession.scanQrCode")}
              </Button>
              <div className="relative flex items-center">
                <div className="flex-grow border-t" />
                <span className="px-4 text-sm text-muted-foreground">{t("jamSession.or")}</span>
                <div className="flex-grow border-t" />
              </div>
              <div className="space-y-2">
                <Input
                  placeholder={t("jamSession.pasteConnectionString")}
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                />
                <Button className="w-full" onClick={handleConnect}>
                  {t("jamSession.connect")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
