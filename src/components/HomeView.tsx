import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import type { Contact } from '@/types';

interface HomeViewProps {
  userId: string;
  contacts: Contact[];
  newContactId: string;
  isAddContactOpen: boolean;
  onCopyUserId: () => void;
  onAddContact: () => void;
  onOpenChat: (contact: Contact) => void;
  onSetNewContactId: (id: string) => void;
  onSetIsAddContactOpen: (open: boolean) => void;
  onSetCurrentView: (view: 'home' | 'chat' | 'profile' | 'video') => void;
}

const HomeView = ({
  userId,
  contacts,
  newContactId,
  isAddContactOpen,
  onCopyUserId,
  onAddContact,
  onOpenChat,
  onSetNewContactId,
  onSetIsAddContactOpen,
  onSetCurrentView,
}: HomeViewProps) => {
  return (
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
                onClick={onCopyUserId}
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
              <Dialog open={isAddContactOpen} onOpenChange={onSetIsAddContactOpen}>
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
                        onChange={(e) => onSetNewContactId(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <Button onClick={onAddContact} className="w-full bg-gradient-to-r from-primary to-secondary">
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
                    onClick={() => onOpenChat(contact)}
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
                        <p className="font-semibold">{contact.nickname}</p>
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
            onClick={() => onSetCurrentView('home')}
            className="flex-col h-auto py-2 hover:bg-primary/10"
          >
            <Icon name="Home" size={24} className="mb-1" />
            <span className="text-xs">Главная</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetCurrentView('profile')}
            className="flex-col h-auto py-2 hover:bg-primary/10"
          >
            <Icon name="User" size={24} className="mb-1" />
            <span className="text-xs">Профиль</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default HomeView;
