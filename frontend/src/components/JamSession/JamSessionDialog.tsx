import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useJamSession } from '@/contexts/JamSessionContext';
import { Music, QrCode, Wifi, LogOut, Loader2, ScanLine } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const JamSessionDialog = () => {
 const { role, isSessionActive, startSession, createPeerConnection, confirmPeerConnection, joinSession, endSession, peers } = useJamSession();
 const [isOpen, setIsOpen] = useState(false);
 const [activeTab, setActiveTab] = useState('host');
 const navigate = useNavigate();

 // Host State
 const [hostSignal, setHostSignal] = useState<string>('');
 const [isScanningAnswer, setIsScanningAnswer] = useState(false);
 const [currentPeerId, setCurrentPeerId] = useState<string>('');

 // Peer State
 const [isScanningOffer, setIsScanningOffer] = useState(false);
 const [peerAnswer, setPeerAnswer] = useState<string>('');

 // Navigate to Live Session page when connected (Peer)
 useEffect(() => {
  if (role === 'peer' && peers.some(p => p.connected)) {
   setIsOpen(false);
   navigate('/song/live'); // Treat "live" as a special ID
  }
 }, [role, peers, navigate]);

 const handleStartSession = () => {
  startSession();
  // Automatically prepare first peer slot
  generateNewPeer();
 };

 const generateNewPeer = async () => {
  try {
   const { id, signal } = await createPeerConnection();
   setHostSignal(signal);
   setCurrentPeerId(id);
   setIsScanningAnswer(false);
  } catch (e) {
   console.error(e);
   toast.error('Failed to generate connection signal');
  }
 };

 const handleHostScan = (detectedCodes: { rawValue: string }[]) => {
  if (detectedCodes.length > 0) {
   const value = detectedCodes[0].rawValue;
   if (currentPeerId) {
    confirmPeerConnection(currentPeerId, value);
    setIsScanningAnswer(false);
    setHostSignal('');
    setCurrentPeerId('');
    toast.success("Peer connected!");
   }
  }
 };

 const handlePeerScan = async (detectedCodes: { rawValue: string }[]) => {
  if (detectedCodes.length > 0) {
   const value = detectedCodes[0].rawValue;
   try {
    setIsScanningOffer(false);
    const answer = await joinSession(value);
    setPeerAnswer(answer);
   } catch (e) {
    console.error(e);
    toast.error('Invalid Host QR Code');
    setIsScanningOffer(true); // Retry
   }
  }
 };

 return (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
   <DialogTrigger asChild>
    <Button variant={isSessionActive ? "outline" : "ghost"} size={isSessionActive ? "default" : "icon"} className={isSessionActive ? "gap-2" : ""} title="Jam Session">
     <Wifi className="h-5 w-5" />
     {isSessionActive && (role === 'host' ? 'Hosting Jam' : 'Joined Jam')}
    </Button>
   </DialogTrigger>
   <DialogContent className="sm:max-w-md">
    <DialogHeader>
     <DialogTitle>{isSessionActive ? 'Jam Session Active' : 'Jam Session'}</DialogTitle>
     <DialogDescription>
      {isSessionActive
       ? (role === 'host' ? 'Manage your connected peers.' : 'You are connected to a jam session.')
       : 'Connect with nearby musicians to sync chord sheets and auto-scroll. No internet required.'}
     </DialogDescription>
    </DialogHeader>

    {!isSessionActive ? (
     <Tabs defaultValue="host" onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
       <TabsTrigger value="host">Host Session</TabsTrigger>
       <TabsTrigger value="peer">Join Session</TabsTrigger>
      </TabsList>

      <TabsContent value="host" className="space-y-4 pt-4">
       <div className="space-y-2">
        <h3 className="font-medium">Start a new session</h3>
        <p className="text-sm text-muted-foreground">
         You will share your current chord sheet and control the session (scroll, transpose, etc).
        </p>
       </div>
       <Button onClick={handleStartSession} className="w-full">
        Start Hosting
       </Button>
      </TabsContent>

      <TabsContent value="peer" className="space-y-4 pt-4">
       {!isScanningOffer && !peerAnswer && (
        <>
         <div className="space-y-2">
          <h3 className="font-medium">Join existing session</h3>
          <p className="text-sm text-muted-foreground">
           Scan the host's QR code to sync with their session.
          </p>
         </div>
         <Button onClick={() => setIsScanningOffer(true)} className="w-full">
          <ScanLine className="mr-2 h-4 w-4" /> Scan Host QR
         </Button>
        </>
       )}

       {isScanningOffer && (
        <div className="space-y-4">
         <div className="w-full aspect-square relative overflow-hidden rounded-lg bg-black">
          <Scanner onScan={handlePeerScan} />
         </div>
         <Button variant="ghost" onClick={() => setIsScanningOffer(false)} className="w-full">Cancel</Button>
        </div>
       )}

       {peerAnswer && (
        <div className="flex flex-col items-center gap-4">
         <div className="flex items-center gap-2 text-green-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-medium">Scanned! Now show this to Host:</span>
         </div>
         <div className="bg-white p-2 rounded shadow-sm border">
          {/* @ts-ignore */}
          <QRCodeSVG value={peerAnswer} size={200} />
         </div>
         <p className="text-xs text-muted-foreground text-center">
          Waiting for host to confirm...
         </p>
        </div>
       )}
      </TabsContent>
     </Tabs>
    ) : (
     <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
       <div className="flex items-center gap-2">
        <Music className="h-5 w-5 text-primary" />
        <span className="font-medium">Status</span>
       </div>
       <span className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-900/30 dark:text-green-400">
        Active ({peers.filter(p => p.connected).length} peers)
       </span>
      </div>

      {role === 'host' && (
       <div className="space-y-4">
        <div className="text-sm font-medium">Add New Musician</div>
        {/* Steps to add new peer */}
        {!hostSignal && !isScanningAnswer && (
         <Button onClick={generateNewPeer} className="w-full">
          <QrCode className="mr-2 h-4 w-4" /> Add Peer (Generate QR)
         </Button>
        )}

        {hostSignal && (
         <div className="flex flex-col items-center gap-4 border p-4 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">Ask peer to scan this code:</p>
          <div className="bg-white p-2 rounded">
           {/* @ts-ignore */}
           <QRCodeSVG value={hostSignal} size={200} />
          </div>
          <Button onClick={() => { setHostSignal(''); setIsScanningAnswer(true); }} className="w-full">
           Next: Scan Peer's QR
          </Button>
         </div>
        )}

        {isScanningAnswer && (
         <div className="flex flex-col items-center gap-4 border p-4 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">Scan the peer's QR code:</p>
          <div className="w-full aspect-square relative overflow-hidden rounded-lg bg-black">
           <Scanner onScan={handleHostScan} />
          </div>
          <Button variant="ghost" onClick={() => setIsScanningAnswer(false)}>Cancel</Button>
         </div>
        )}
       </div>
      )}

      {role === 'peer' && peerAnswer && (
       <div className="flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-center">Show this to Host to finalize connection:</p>
        <div className="bg-white p-2 rounded">
         {/* @ts-ignore */}
         <QRCodeSVG value={peerAnswer} size={200} />
        </div>
       </div>
      )}

      <Button variant="destructive" onClick={endSession} className="w-full mt-4">
       <LogOut className="mr-2 h-4 w-4" /> End Session
      </Button>
     </div>
    )}
   </DialogContent>
  </Dialog>
 );
};
