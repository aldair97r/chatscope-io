import { useState, useEffect } from "react";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  Avatar,
  ConversationHeader,
  VoiceCallButton,
  VideoCallButton,
  TypingIndicator,
  MessageSeparator,
} from "@chatscope/chat-ui-kit-react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";

interface User {
  id: string;
  name: string;
  avatar: string;
  status: string;
}

interface ChatMessage {
  message: string;
  senderId: string;
  receiverId: string;
  sentTime: string;
}

type TypingState = Record<string, { senderId: string; senderName: string } | null>;
type UserStatus = "available" | "unavailable" | "away" | "dnd" | "invisible" | "eager";

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "eager", label: "Eager" },
  { value: "away", label: "Away" },
  { value: "dnd", label: "Do not disturb" },
  { value: "invisible", label: "Invisible" },
  { value: "unavailable", label: "Unavailable" },
];

interface Group {
  id: string;
  name: string;
  avatar: string;
  members: string[];
}

interface ChatWindowProps {
  currentUser: User;
  allMessages: ChatMessage[];
  onSendMessage: (text: string, senderId: string, receiverId: string) => void;
  onTyping: (senderId: string, senderName: string, receiverId: string, isTyping: boolean) => void;
  typingUsers: TypingState;
  userStatuses: Record<string, UserStatus>;
  onStatusChange: (userId: string, status: UserStatus) => void;
  friends: User[];
  groups: Group[];
  allUsers: User[];
}

export const ChatWindow = ({ currentUser, allMessages, onSendMessage, onTyping, typingUsers, userStatuses, onStatusChange, friends, groups, allUsers }: ChatWindowProps) => {
  const [selectedConversationId, setSelectedConversationId] = useState<string>(friends[0]?.id ?? groups[0]?.id ?? "");
  const [readCounts, setReadCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Helper para encontrar usuario por ID
  const findUser = (id: string) => allUsers.find(u => u.id === id);

  // Grupos donde el usuario es miembro
  const myGroups = groups.filter(g => g.members.includes(currentUser.id));

  // Determinar si la conversación seleccionada es un grupo
  const selectedGroup = groups.find(g => g.id === selectedConversationId);
  const isGroupSelected = !!selectedGroup;
  const selectedFriend = isGroupSelected ? null : friends.find(f => f.id === selectedConversationId);

  const conversationMessages = isGroupSelected
    ? allMessages.filter(m => m.receiverId === selectedConversationId)
    : allMessages.filter(
        m =>
          (m.senderId === currentUser.id && m.receiverId === selectedConversationId) ||
          (m.senderId === selectedConversationId && m.receiverId === currentUser.id)
      );

  // Marcar como leídos los mensajes de la conversación activa
  const incomingFromSelected = isGroupSelected
    ? allMessages.filter(m => m.receiverId === selectedConversationId && m.senderId !== currentUser.id).length
    : allMessages.filter(m => m.senderId === selectedConversationId && m.receiverId === currentUser.id).length;

  useEffect(() => {
    setReadCounts(prev => ({ ...prev, [selectedConversationId]: incomingFromSelected }));
  }, [selectedConversationId, incomingFromSelected]);

  // Typing indicator para la conversación seleccionada
  const getTypingContent = () => {
    if (isGroupSelected) {
      const typers = Object.entries(typingUsers)
        .filter(([key, val]) => key.endsWith(`->${selectedConversationId}`) && val && val.senderId !== currentUser.id)
        .map(([, val]) => val!.senderName);
      if (typers.length === 0) return null;
      return `${typers.join(", ")} ${typers.length === 1 ? "is" : "are"} typing`;
    }
    const entry = typingUsers[`${selectedConversationId}->${currentUser.id}`];
    if (!entry) return null;
    return `${selectedFriend?.name} is typing`;
  };

  const typingContent = getTypingContent();

  return (
    <div style={{ height: "400px", border: "1px solid #d1d1d1", borderRadius: "8px", overflow: "hidden" }}>
      <MainContainer responsive>
        <Sidebar position="left" scrollable={false}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5em", padding: "0.6em 0.8em", borderBottom: "1px solid #d1d1d1" }}>
            <Avatar src={currentUser.avatar} name={currentUser.name} status={userStatuses[currentUser.id] ?? "available"} size="md" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.85em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser.name}</div>
              <select
                value={userStatuses[currentUser.id] ?? "available"}
                onChange={(e) => onStatusChange(currentUser.id, e.target.value as UserStatus)}
                style={{ fontSize: "0.7em", border: "none", background: "transparent", color: "#888", cursor: "pointer", padding: 0, outline: "none" }}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Search placeholder="Search..." value={searchQuery} onChange={(v) => setSearchQuery(v)} onClearClick={() => setSearchQuery("")} />
          <ConversationList>
            {friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(friend => {
              const friendMessages = allMessages.filter(
                m =>
                  (m.senderId === currentUser.id && m.receiverId === friend.id) ||
                  (m.senderId === friend.id && m.receiverId === currentUser.id)
              );
              const lastMsg = friendMessages[friendMessages.length - 1];
              const totalIncoming = allMessages.filter(
                m => m.senderId === friend.id && m.receiverId === currentUser.id
              ).length;
              const unreadCount = totalIncoming - (readCounts[friend.id] ?? 0);
              const isFriendTyping = !!typingUsers[`${friend.id}->${currentUser.id}`];

              const lastTime = lastMsg ? new Date(lastMsg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

              return (
                <Conversation
                  key={friend.id}
                  name={friend.name}
                  lastSenderName={lastMsg ? (lastMsg.senderId === currentUser.id ? currentUser.name : friend.name) : friend.name}
                  info={isFriendTyping
                    ? <span className="typing-dots">typing<span>.</span><span>.</span><span>.</span></span>
                    : (lastMsg?.message ?? friend.status)
                  }
                  lastActivityTime={lastTime}
                  active={friend.id === selectedConversationId}
                  unreadCnt={unreadCount}
                  onClick={() => setSelectedConversationId(friend.id)}
                >
                  <Avatar src={friend.avatar} name={friend.name} status={userStatuses[friend.id] ?? "available"} />
                </Conversation>
              );
            })}

            {/* Chats grupales - solo visibles para miembros */}
            {myGroups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())).map(group => {
              const groupMessages = allMessages.filter(m => m.receiverId === group.id);
              const lastGroupMsg = groupMessages[groupMessages.length - 1];
              const totalGroupIncoming = groupMessages.filter(m => m.senderId !== currentUser.id).length;
              const groupUnread = totalGroupIncoming - (readCounts[group.id] ?? 0);
              const groupTypers = Object.entries(typingUsers)
                .filter(([key, val]) => key.endsWith(`->${group.id}`) && val && val.senderId !== currentUser.id)
                .map(([, val]) => val!.senderName);

              const lastSenderName = lastGroupMsg ? findUser(lastGroupMsg.senderId)?.name : undefined;
              const lastGroupTime = lastGroupMsg ? new Date(lastGroupMsg.sentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined;

              return (
                <Conversation
                  key={group.id}
                  name={group.name}
                  lastSenderName={lastSenderName}
                  info={groupTypers.length > 0
                    ? <span className="typing-dots">typing<span>.</span><span>.</span><span>.</span></span>
                    : (lastGroupMsg?.message ?? group.members.filter((id: string) => id !== currentUser.id).map((id: string) => findUser(id)?.name).filter(Boolean).join(", "))
                  }
                  lastActivityTime={lastGroupTime}
                  active={selectedConversationId === group.id}
                  unreadCnt={groupUnread}
                  onClick={() => setSelectedConversationId(group.id)}
                >
                  <Avatar src={group.avatar} name={group.name} />
                </Conversation>
              );
            })}
          </ConversationList>
        </Sidebar>

        <ChatContainer>
          <ConversationHeader>
            <ConversationHeader.Back />
            {isGroupSelected ? (
              <Avatar src={selectedGroup!.avatar} name={selectedGroup!.name} />
            ) : (
              <Avatar src={selectedFriend?.avatar ?? ""} name={selectedFriend?.name ?? ""} status={selectedFriend ? userStatuses[selectedFriend.id] : undefined} />
            )}
            <ConversationHeader.Content
              userName={isGroupSelected ? selectedGroup!.name : (selectedFriend?.name ?? "")}
              info={typingContent ?? (isGroupSelected ? `${selectedGroup!.members.length} members` : "Active now")}
            />
            <ConversationHeader.Actions>
              <VoiceCallButton />
              <VideoCallButton />
            </ConversationHeader.Actions>
          </ConversationHeader>

          <MessageList
            typingIndicator={typingContent ? <TypingIndicator content={typingContent} /> : undefined}
          >
            {conversationMessages.map((m, i) => {
              const isOwn = m.senderId === currentUser.id;
              const sender = findUser(m.senderId);
              const msgDate = new Date(m.sentTime);
              const time = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = msgDate.toLocaleDateString();

              const prevMsg = conversationMessages[i - 1];
              const prevDateStr = prevMsg ? new Date(prevMsg.sentTime).toLocaleDateString() : null;
              const showDateSeparator = dateStr !== prevDateStr;

              return (
                <span key={i}>
                  {showDateSeparator && <MessageSeparator>{dateStr}</MessageSeparator>}
                  <Message
                    model={{
                      message: m.message,
                      sentTime: m.sentTime,
                      sender: sender?.name ?? m.senderId,
                      direction: isOwn ? "outgoing" : "incoming",
                      position: "single",
                    }}
                  >
                    <Avatar src={isOwn ? currentUser.avatar : (sender?.avatar ?? "")} />
                    <Message.Footer sentTime={time} />
                  </Message>
                </span>
              );
            })}
          </MessageList>

          <MessageInput
            placeholder="Type here..."
            onSend={(val) => {
              onSendMessage(val, currentUser.id, selectedConversationId);
              onTyping(currentUser.id, currentUser.name, selectedConversationId, false);
            }}
            onChange={(val) => {
              const hasText = val.replace(/<[^>]*>/g, "").trim().length > 0;
              onTyping(currentUser.id, currentUser.name, selectedConversationId, hasText);
            }}
            attachButton={false}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};
