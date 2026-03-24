import { useState, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';

// Datos de ejemplo simulando los usuarios de la imagen
const USERS = [
  { id: "zoe", name: "Zoe", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Zoe", status: "Morning coffee" },
  { id: "joe", name: "Joe", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=1", status: "Boring" },
  { id: "akane", name: "Akane", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=7", status: "I love chatscope" },
  { id: "eliot", name: "Eliot", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=023", status: "@work" },
];

interface Group {
  id: string;
  name: string;
  avatar: string;
  members: string[];
}

// Tipos de contenido que se pueden enviar
export type MessageContent =
  | { type: 'text'; text: string }
  | { type: 'component'; componentType: string; props?: Record<string, unknown> }
  | { type: 'image'; src: string; alt?: string }
  | { type: 'file'; name: string; size: string; mimeType: string };

// Componentes disponibles para enviar
export const AVAILABLE_COMPONENTS = [
  { id: 'button', name: 'Botón', description: 'Botón interactivo' },
  { id: 'card', name: 'Tarjeta', description: 'Tarjeta de información' },
  { id: 'alert', name: 'Alerta', description: 'Mensaje de alerta' },
  { id: 'badge', name: 'Badge', description: 'Etiqueta de estado' },
] as const;

const GROUPS: Group[] = [
  { id: "group-all", name: "Group chat", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Group", members: ["zoe", "joe", "akane", "eliot"] },
  { id: "group-no-eliot", name: "Without Eliot", avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=Secret", members: ["zoe", "joe", "akane"] },
];

type TypingState = Record<string, { senderId: string; senderName: string } | null>;
type UserStatus = "available" | "unavailable" | "away" | "dnd" | "invisible" | "eager";

function App() {
  const [messages, setMessages] = useState<{ content: MessageContent; senderId: string; receiverId: string; sentTime: string }[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingState>({});
  const [userStatuses, setUserStatuses] = useState<Record<string, UserStatus>>(
    Object.fromEntries(USERS.map(u => [u.id, "available"]))
  );

  const handleStatusChange = useCallback((userId: string, status: UserStatus) => {
    setUserStatuses(prev => ({ ...prev, [userId]: status }));
  }, []);

  const handleSendMessage = (content: MessageContent, senderId: string, receiverId: string) => {
    const newMessage = {
      content,
      senderId,
      receiverId,
      sentTime: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
    // Limpiar typing al enviar
    setTypingUsers(prev => {
      const next = { ...prev };
      // Remover todas las entradas donde este sender estaba escribiendo
      for (const key in next) {
        if (next[key]?.senderId === senderId) next[key] = null;
      }
      return next;
    });
  };

  const handleTyping = useCallback((senderId: string, senderName: string, receiverId: string, isTyping: boolean) => {
    const key = `${senderId}->${receiverId}`;
    setTypingUsers(prev => ({
      ...prev,
      [key]: isTyping ? { senderId, senderName } : null,
    }));
  }, []);

  return (
    <div style={{
      padding: "30px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      backgroundColor: "#f0f2f5",
      minHeight: "100vh"
    }}>
      {USERS.map(user => (
        <div key={user.id}>
          <ChatWindow
            currentUser={user}
            allMessages={messages}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            typingUsers={typingUsers}
            userStatuses={userStatuses}
            onStatusChange={handleStatusChange}
            friends={USERS.filter(u => u.id !== user.id)}
            groups={GROUPS}
            allUsers={USERS}
          />
        </div>
      ))}
    </div>
  );
}

export default App;
