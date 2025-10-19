import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Contact } from '@/types';

interface VideoCallViewProps {
  selectedContact: Contact;
  callDuration: number;
  isMicOn: boolean;
  isCameraOn: boolean;
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  formatCallDuration: (seconds: number) => string;
}

const VideoCallView = ({
  selectedContact,
  callDuration,
  isMicOn,
  isCameraOn,
  localVideoRef,
  remoteVideoRef,
  onToggleMic,
  onToggleCamera,
  onEndCall,
  formatCallDuration,
}: VideoCallViewProps) => {
  return (
    <div className="animate-scale-in fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">{selectedContact.nickname}</span>
            <span className="text-white/70 text-sm">{formatCallDuration(callDuration)}</span>
          </div>
        </div>

        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-24 right-6 w-32 h-48 rounded-2xl border-2 border-white/20 shadow-2xl object-cover"
        />

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button
            onClick={onToggleMic}
            size="icon"
            className={`w-14 h-14 rounded-full ${
              isMicOn 
                ? 'bg-white/20 hover:bg-white/30' 
                : 'bg-red-500 hover:bg-red-600'
            } backdrop-blur-md`}
          >
            <Icon name={isMicOn ? 'Mic' : 'MicOff'} size={24} />
          </Button>

          <Button
            onClick={onEndCall}
            size="icon"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
          >
            <Icon name="PhoneOff" size={28} />
          </Button>

          <Button
            onClick={onToggleCamera}
            size="icon"
            className={`w-14 h-14 rounded-full ${
              isCameraOn 
                ? 'bg-white/20 hover:bg-white/30' 
                : 'bg-red-500 hover:bg-red-600'
            } backdrop-blur-md`}
          >
            <Icon name={isCameraOn ? 'Video' : 'VideoOff'} size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallView;
