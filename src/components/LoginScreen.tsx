import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [loginName, setLoginName] = useState('');

  const handleLogin = () => {
    if (loginName.trim()) {
      onLogin(loginName);
    }
  };

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
};

export default LoginScreen;
