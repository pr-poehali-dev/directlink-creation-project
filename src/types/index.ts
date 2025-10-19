export interface Contact {
  id: string;
  nickname: string;
  avatar?: string;
  online: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'contact';
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

export type ViewType = 'home' | 'chat' | 'profile' | 'video';
