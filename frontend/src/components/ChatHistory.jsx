import ChatMessage from './ChatMessage';
import useAutoScroll from '../hooks/useAutoScroll';

export default function ChatHistory({ messages }) {
  const scrollRef = useAutoScroll(messages);
  //  console.log(messages);
  return (
    <div 
      ref={scrollRef}
      className="bg-gray-50 flex-1 rounded-lg p-4 h-[calc(100vh-300px)] overflow-y-auto mb-4 scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          Start a conversation by asking a question about your PDFs
        </div>
      ) : (
        messages.map((msg, index) => (
          <ChatMessage
          key={index}
          isLastMessageFromUser={msg.isUser && index === messages.length - 1}
            message={msg.text}
            isUser={msg.isUser}
          />
        ))
      )}
    </div>
  );
}