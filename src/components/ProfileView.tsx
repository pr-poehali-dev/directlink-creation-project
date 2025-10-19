import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface ProfileViewProps {
  userId: string;
  nickname: string;
  contactsCount: number;
  onSetNickname: (nickname: string) => void;
  onSetCurrentView: (view: 'home' | 'chat' | 'profile' | 'video') => void;
  onLogout: () => void;
}

const ProfileView = ({
  userId,
  nickname,
  contactsCount,
  onSetNickname,
  onSetCurrentView,
  onLogout,
}: ProfileViewProps) => {
  return (
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
              onChange={(e) => onSetNickname(e.target.value)}
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
              <Badge variant="outline">{contactsCount}</Badge>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full"
            onClick={onLogout}
          >
            <Icon name="LogOut" size={20} className="mr-2" />
            Выйти из аккаунта
          </Button>

          <Button
            onClick={() => onSetCurrentView('home')}
            variant="outline"
            className="w-full"
          >
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Назад
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ProfileView;
