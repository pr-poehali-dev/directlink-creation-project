import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Contact {
  id: string;
  nickname: string;
  avatar?: string;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'contact';
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

const generateUserId = () => {
  const words = ['ocean', 'star', 'moon', 'sky', 'sun', 'cloud', 'wave', 'wind', 'fire', 'earth'];
  const word1 = words[Math.floor(Math.random() * words.length)];
  const word2 = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(Math.random() * 9999);
  return `${word1}-${num}-${word2}`;
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState('');
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'profile' | 'video'>('home');
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
  
  const WS_URL = 'https://functions.poehali.dev/d21ff742-3104-4563-aec9-0410990b7e2e';

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

  const handleLogin = () => {
    if (loginName.trim()) {
      const newUserId = generateUserId();
      setUserId(newUserId);
      setNickname(loginName);
      setIsLoggedIn(true);
      
      localStorage.setItem('userId', newUserId);
      localStorage.setItem('nickname', loginName);
      
      toast.success(`Добро пожаловать, ${loginName}!`);
    }
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#261940] to-[#0f1419] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary via-secondary to-accent p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Ichiev Network</h1>
            <p className="text-white/80">Приватная социальная сеть</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-name" className="text-lg">Введите ваше имя</Label>
              <Input
                id="login-name"
                placeholder="Например: Иван"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="h-12 text-lg"
                autoFocus
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 text-lg bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all"
              disabled={!loginName.trim()}
            >
              Войти
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              После входа вам будет присвоен уникальный ID для общения
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#261940] to-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {currentView === 'home' && (
          <div className="animate-fade-in">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Ichiev Network</h1>
                <p className="text-white/80 text-sm">Приватная социальная сеть</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-4 border border-primary/30">
                  <p className="text-muted-foreground text-sm mb-2">Ваш уникальный ID</p>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-lg font-semibold text-white bg-black/30 px-4 py-2 rounded-lg">
                      {userId}
                    </code>
                    <Button
                      onClick={copyUserId}
                      size="icon"
                      variant="ghost"
                      className="hover:bg-white/10"
                    >
                      <Icon name="Copy" size={20} />
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Контакты</h2>
                    <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                          <Icon name="UserPlus" size={16} className="mr-2" />
                          Добавить
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Добавить контакт</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor="contact-id">ID пользователя</Label>
                            <Input
                              id="contact-id"
                              placeholder="alpha-7531-bravo"
                              value={newContactId}
                              onChange={(e) => setNewContactId(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <Button onClick={addContact} className="w-full bg-gradient-to-r from-primary to-secondary">
                            Отправить запрос
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <Card
                          key={contact.id}
                          onClick={() => openChat(contact)}
                          className="p-4 cursor-pointer hover:bg-primary/10 transition-all duration-300 hover:scale-[1.02] border-border/50 bg-card/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar>
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                                  {contact.nickname[0]}
                                </AvatarFallback>
                              </Avatar>
                              {contact.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{contact.nickname}</p>
                              <p className="text-sm text-muted-foreground">{contact.id}</p>
                            </div>
                            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="p-4 border-t border-border/50 flex justify-around">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('home')}
                  className="flex-col h-auto py-2 hover:bg-primary/10"
                >
                  <Icon name="Home" size={24} className="mb-1" />
                  <span className="text-xs">Главная</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('profile')}
                  className="flex-col h-auto py-2 hover:bg-primary/10"
                >
                  <Icon name="User" size={24} className="mb-1" />
                  <span className="text-xs">Профиль</span>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {currentView === 'chat' && selectedContact && (
          <div className="animate-slide-up">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden h-[600px] flex flex-col">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-4 flex items-center gap-3">
                <Button
                  onClick={() => setCurrentView('home')}
                  size="icon"
                  variant="ghost"
                  className="hover:bg-white/10"
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="bg-white/20 text-white">
                    {selectedContact.nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-white">{selectedContact.nickname}</p>
                  <p className="text-xs text-white/70">
                    {selectedContact.online ? 'в сети' : 'не в сети'}
                  </p>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="hover:bg-white/10"
                  onClick={startVideoCall}
                >
                  <Icon name="Video" size={20} />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} animate-scale-in`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          message.sender === 'me'
                            ? 'bg-gradient-to-r from-primary to-secondary text-white'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <p className="text-xs opacity-70">{message.time}</p>
                          {message.sender === 'me' && (
                            <Icon
                              name={message.status === 'read' ? 'CheckCheck' : 'Check'}
                              size={14}
                              className="opacity-70"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50">
                <div className="flex gap-2">
                  <Input
                    placeholder="Введите сообщение..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    size="icon"
                    className="bg-gradient-to-r from-primary to-secondary"
                  >
                    <Icon name="Send" size={20} />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentView === 'video' && selectedContact && (
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
                  onClick={toggleMic}
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
                  onClick={endVideoCall}
                  size="icon"
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <Icon name="PhoneOff" size={28} />
                </Button>

                <Button
                  onClick={toggleCamera}
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
        )}

        {currentView === 'profile' && (
          <div className="animate-fade-in">
            <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-secondary to-accent p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white/20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-white/20 text-white text-3xl">
                    {nickname[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white">{nickname}</h2>
                <p className="text-white/70 text-sm mt-1">{userId}</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <Label htmlFor="nickname">Никнейм</Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Icon name="Shield" size={20} className="text-primary" />
                      <span className="text-sm">Шифрование end-to-end</span>
                    </div>
                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50">
                      Активно
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Icon name="Users" size={20} className="text-secondary" />
                      <span className="text-sm">Контактов</span>
                    </div>
                    <Badge variant="outline">{contacts.length}</Badge>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    localStorage.removeItem('userId');
                    localStorage.removeItem('nickname');
                    setIsLoggedIn(false);
                    setUserId('');
                    setNickname('');
                    setContacts([]);
                    setMessages([]);
                    toast.info('Вы вышли из аккаунта');
                  }}
                >
                  <Icon name="LogOut" size={20} className="mr-2" />
                  Выйти из аккаунта
                </Button>

                <Button
                  onClick={() => setCurrentView('home')}
                  variant="outline"
                  className="w-full"
                >
                  Назад
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;