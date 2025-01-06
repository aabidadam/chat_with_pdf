import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

export default function ChatInterface({ messages, onSendMessage }) {
  return (
    <div className="h-full flex flex-col justify-between">
      <ChatHistory messages={messages} />
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
}