import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Maximize2, Minimize2, Send, Bot } from 'lucide-react';
import { getBotResponse, INITIAL_SUGGESTIONS } from './chatKnowledge';

// Renders a response string that may contain markdown-lite formatting:
// **bold**, bullet points (•), and newlines.
function BotMessage({ text }) {
  const lines = text.split('\n');
  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;

        // Convert **bold** spans
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        return (
          <p key={i} className={line.startsWith('•') || line.match(/^\d+\./) ? 'pl-2' : ''}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "Hi there! 👋 I'm your **Zero-Waste Food Connect** assistant.\n\nI can explain how the platform works, how restaurants donate food, how NGOs receive donations, and much more.\n\nWhat would you like to know?",
      followUps: INITIAL_SUGGESTIONS,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate realistic bot typing delay (scales with response length)
    setTimeout(() => {
      const knowledge = getBotResponse(text);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: knowledge?.response || "I'm not sure about that. Try asking about how the platform works, how restaurants donate food, or the NGO process.",
          followUps: knowledge?.followUps || [],
        },
      ]);
    }, 900 + Math.min(text.length * 8, 800));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend(input);
    }
  };

  // The last bot message's follow-ups (if any) are shown as quick replies
  const lastBotMsg = [...messages].reverse().find((m) => m.sender === 'bot');
  const quickReplies = lastBotMsg?.followUps || [];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-brand-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-700 transition-transform hover:scale-105 z-50 animate-bounce-slow"
          aria-label="Open Chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out border border-gray-200 overflow-hidden
            ${isFullscreen
              ? 'inset-0 md:inset-4 md:rounded-2xl'
              : 'bottom-6 right-6 w-[380px] h-[560px] rounded-2xl max-w-[calc(100vw-32px)]'
            }
          `}
        >
          {/* Header */}
          <div className="bg-brand-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Platform Assistant</h3>
                <p className="text-[11px] text-brand-100">Ask me anything about Zero-Waste Food Connect</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                title="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mr-2 mt-1">
                    <Bot size={12} className="text-brand-600" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-none shadow-md text-sm'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm border border-gray-100'
                  }`}
                >
                  {msg.sender === 'bot' ? (
                    <BotMessage text={msg.text} />
                  ) : (
                    <span className="text-sm">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex w-full justify-start">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mr-2 mt-1">
                  <Bot size={12} className="text-brand-600" />
                </div>
                <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-1.5 h-10">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            {/* Quick Reply Suggestions */}
            {!isTyping && quickReplies.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1 ml-8">
                <p className="text-[11px] text-gray-400 font-medium">You might also ask:</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="text-left text-[12px] bg-brand-50 text-brand-700 border border-brand-200 rounded-full px-3 py-1.5 hover:bg-brand-100 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pr-1.5 pl-4 py-1.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
              <input
                type="text"
                placeholder="Ask about the platform, NGOs, restaurants…"
                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 placeholder:text-gray-400 py-1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-brand-700 transition-colors"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              I answer questions about the Zero-Waste Food Connect platform only.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
