export default function ChatMessage({ message, isUser, isLastMessageFromUser }) {
  // Function to parse and format text with bold markers
  const formatMessage = (text) => {
    if (typeof text !== 'string') return text;
    
    // Split the text into segments based on ** markers
    const segments = text.split(/(\*\*.*?\*\*)/g);
    
    return segments.map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        const boldText = segment.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      return <span key={index}>{segment}</span>;
    });
  };

  // Function to separate message content from citations
  const separateSourceCitations = (text) => {
    const sourcePattern = /\[Source:.*?\]/g;
    const citations = [...new Set(text.match(sourcePattern) || [])]; // Remove duplicates using Set
    const content = text.replace(sourcePattern, '').trim();
    return { content, citations };
  };

  return (
    <>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 text-justify ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          {typeof message === 'string' 
            ? (() => {
                const { content, citations } = separateSourceCitations(message);
                return (
                  <>
                    {content.split('\n').map((line, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {formatMessage(line)}
                      </p>
                    ))}
                    {citations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-300 text-sm text-gray-600">
                        {citations.map((citation, i) => (
                          <p key={i} className="italic">
                            {citation}
                          </p>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()
            : message
          }
        </div>
      </div>
      
      {isLastMessageFromUser && (
        <div className="flex justify-start mb-4 text-gray-500">
          <p className="flex items-center">
            Loading
            <span className="dot-1 ml-1">.</span>
            <span className="dot-2">.</span>
            <span className="dot-3">.</span>
          </p>
        </div>
      )}
    </>
  );
}