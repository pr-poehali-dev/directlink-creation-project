import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { Contact, Message, ViewType } from '@/types';
import { generateUserId } from '@/utils/generateUserId';
import LoginScreen from '@/components/LoginScreen';
import HomeView from '@/components/HomeView';
import ChatView from '@/components/ChatView';
import VideoCallView from '@/components/VideoCallView';
import ProfileView from '@/components/ProfileView';

const WS_URL = 'https://functions.poehali.dev/d21ff742-3104-4563-aec9-0410990b7e2e';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContactId, setNewContactId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<number | null>(null);
  const wsConnectionRef = useRef<boolean>(false);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const copyUserId = () => {
    navigator.clipboard.writeText(userId);
    toast.success('ID скопирован в буфер обмена');
  };

  const addContact = () => {
    if (newContactId.trim()) {
      const newContact: Contact = {
        id: newContactId,
        nickname: 'Новый контакт',
        online: false,
      };
      setContacts([...contacts, newContact]);
      setNewContactId('');
      setIsAddContactOpen(false);
      toast.success('Контакт добавлен');
    }
  };

  const sendMessage = async () => {
    if (messageText.trim() && selectedContact) {
      const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'me',
        time: currentTime,
        status: 'sent',
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
      
      try {
        const response = await fetch(WS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'message',
            from: userId,
            to: selectedContact.id,
            text: messageText,
            time: currentTime,
          }),
        });
        
        const result = await response.json();
        if (result.delivered) {
          setMessages(msgs => 
            msgs.map(m => 
              m.id === newMessage.id ? { ...m, status: 'delivered' } : m
            )
          );
        }
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        toast.error('Не удалось отправить сообщение');
      }
    }
  };

  const openChat = (contact: Contact) => {
    setSelectedContact(contact);
    setCurrentView('chat');
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      
      setIsVideoCall(true);
      setCurrentView('video');
      
      callTimerRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      toast.success('Видеозвонок начат');
    } catch (error) {
      toast.error('Не удалось получить доступ к камере/микрофону');
      console.error('Error accessing media devices:', error);
    }
  };

  const endVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    
    setIsVideoCall(false);
    setCallDuration(0);
    setCurrentView('chat');
    toast.info('Видеозвонок завершён');
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
        toast.info(audioTrack.enabled ? 'Микрофон включён' : 'Микрофон выключен');
      }
    }
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
        toast.info(videoTrack.enabled ? 'Камера включена' : 'Камера выключена');
      }
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const connectToWebSocket = async () => {
    if (!wsConnectionRef.current) {
      try {
        const response = await fetch(WS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'connect',
            userId: userId,
          }),
        });
        
        const result = await response.json();
        if (result.type === 'connected') {
          wsConnectionRef.current = true;
          toast.success('Подключено к серверу сообщений');
        }
      } catch (error) {
        console.error('Ошибка подключения к WebSocket:', error);
      }
    }
  };

  const handleLogin = (loginName: string) => {
    const newUserId = generateUserId();
    setUserId(newUserId);
    setNickname(loginName);
    setIsLoggedIn(true);
    
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('nickname', loginName);
    
    toast.success(`Добро пожаловать, ${loginName}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('nickname');
    setIsLoggedIn(false);
    setUserId('');
    setNickname('');
    setContacts([]);
    setMessages([]);
    toast.info('Вы вышли из аккаунта');
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    const savedNickname = localStorage.getItem('nickname');
    
    if (savedUserId && savedNickname) {
      setUserId(savedUserId);
      setNickname(savedNickname);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      connectToWebSocket();
    }
    
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      if (wsConnectionRef.current && userId) {
        fetch(WS_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'disconnect',
            userId: userId,
          }),
        }).catch(console.error);
      }
    };
  }, [isLoggedIn, userId]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#261940] to-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentView === 'home' && (
          <HomeView
            userId={userId}
            contacts={contacts}
            newContactId={newContactId}
            isAddContactOpen={isAddContactOpen}
            onCopyUserId={copyUserId}
            onAddContact={addContact}
            onOpenChat={openChat}
            onSetNewContactId={setNewContactId}
            onSetIsAddContactOpen={setIsAddContactOpen}
            onSetCurrentView={setCurrentView}
          />
        )}

        {currentView === 'chat' && selectedContact && (
          <ChatView
            selectedContact={selectedContact}
            messages={messages}
            messageText={messageText}
            onSetCurrentView={setCurrentView}
            onSendMessage={sendMessage}
            onSetMessageText={setMessageText}
            onStartVideoCall={startVideoCall}
          />
        )}

        {currentView === 'video' && selectedContact && (
          <VideoCallView
            selectedContact={selectedContact}
            callDuration={callDuration}
            isMicOn={isMicOn}
            isCameraOn={isCameraOn}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            onToggleMic={toggleMic}
            onToggleCamera={toggleCamera}
            onEndCall={endVideoCall}
            formatCallDuration={formatCallDuration}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            userId={userId}
            nickname={nickname}
            contactsCount={contacts.length}
            onSetNickname={setNickname}
            onSetCurrentView={setCurrentView}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
