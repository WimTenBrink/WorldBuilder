
import React, { useEffect, useRef } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import ChatMessage from './ChatMessage';

interface ChatWindowProps {
  messages: ChatMessageType[];
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto pr-2">
       {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-text-secondary-light dark:text-text-secondary-dark">
            <p>Start a conversation by typing in the prompt below.</p>
        </div>
        ) : (
            messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
            ))
        )}
    </div>
  );
};

export default ChatWindow;