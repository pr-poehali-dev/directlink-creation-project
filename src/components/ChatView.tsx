import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Contact, Message } from '@/types';

interface ChatViewProps {
  selectedContact: Contact;
  messages: Message[];
  messageText: string;
  onSetCurrentView: (view: 'home' | 'chat' | 'profile' | 'video') => void;
  onSendMessage: () => void;
  onSetMessageText: (text: string) => void;
  onStartVideoCall: () => void;
}

const ChatView = ({
  selectedContact,
  messages,
  messageText,
  onSetCurrentView,
  onSendMessage,
  onSetMessageText,
  onStartVideoCall,
}: ChatViewProps) => {
  return (
    <div className="animate-slide-up">
      <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden h-[600px] flex flex-col">
        <div className="bg-gradient-to-r from-primary via-secondary to-accent p-4 flex items-center gap-3">
          <Button
            onClick={() => onSetCurrentView('home')}
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
            onClick={onStartVideoCall}
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
              onChange={(e) => onSetMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={onSendMessage}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatView;
