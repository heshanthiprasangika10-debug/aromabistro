import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  Send,
  X,
  Sparkles,
  User,
  Volume2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'staff';
  text: string;
  timestamp: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const { selectedTable, sendMessage: sendStaffMessage, messages: staffMessages, playChime } = useRestaurant();

  const [activeTab, setActiveTab] = useState<'ai' | 'waiter'>('ai');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Ayubowan! 🙏 Welcome to AromaBistro. I am AromaBot, your culinary assistant. You can ask me about dish ingredients, spice levels, vegetarian options, or kitchen recommendations in English or Sinhala. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, staffMessages]);

  const quickPrompts = [
    'Cheese Chicken Kottu eka gana kiyanna 🧀',
    'Vegetarian dishes monawada thiyenne? 🌱',
    'Is the Ceylon Crab Curry spicy? 🌶️',
    'Opening hours & table reservations ⏰',
    'How do I earn AromaRewards points? ⭐'
  ];

  const handleSendAI = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: data.reply || "I'm delighted to assist! Our chef prepares every dish fresh with natural Ceylon spices.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        playChime();
      }
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: "Our signature dishes include the Cheese Chicken Kottu ($14.50) and Wild Ceylon Black Pepper Crab Curry ($24.00). Feel free to ask our waiter if you have special dietary needs!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendStaffMessage(input.trim(), 'customer', selectedTable);
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md h-[550px] bg-stone-900 border border-stone-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-amber-950 p-4 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">AromaBot Concierge</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-stone-400">Powered by Gemini 3.8 AI & Kitchen Sync</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-950 px-2 py-1.5 gap-2 text-xs">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === 'ai' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AromaBot AI</span>
        </button>
        <button
          onClick={() => setActiveTab('waiter')}
          className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
            activeTab === 'waiter' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Table {selectedTable} Staff Chat</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-950/60">
        {activeTab === 'ai' ? (
          <>
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                    m.sender === 'user'
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-stone-800/90 text-stone-200 border border-stone-700/60 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span className="text-[9px] text-stone-400 block text-right mt-1 opacity-70">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-stone-400 text-xs py-2">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>AromaBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        ) : (
          /* Live Waiter & Table Pager Feed */
          <>
            <div className="bg-stone-900 p-2.5 rounded-xl border border-stone-800 text-[11px] text-stone-400">
              Direct live connection to Floor Server & Kitchen Station for Table {selectedTable}.
            </div>
            {staffMessages.map(sm => (
              <div
                key={sm.id}
                className={`flex gap-2.5 ${sm.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    sm.sender === 'customer'
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-stone-800 text-stone-200 border border-stone-700 rounded-tl-none'
                  }`}
                >
                  <div className="text-[10px] font-bold text-amber-300 mb-0.5">
                    {sm.sender === 'customer' ? 'You' : sm.customerName}
                  </div>
                  <p>{sm.message}</p>
                  <span className="text-[9px] text-stone-400 block text-right mt-1 opacity-70">
                    {new Date(sm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Prompts Chips (for AI tab) */}
      {activeTab === 'ai' && (
        <div className="px-3 py-1.5 bg-stone-900 border-t border-stone-800 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendAI(q)}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 rounded-full text-[10px] font-medium border border-stone-700 whitespace-nowrap transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          if (activeTab === 'ai') handleSendAI();
          else handleSendWaiter(e);
        }}
        className="p-3 bg-stone-900 border-t border-stone-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={
            activeTab === 'ai'
              ? 'Ask about menu, spices, kottu (EN or SI)...'
              : `Message floor waiter for Table ${selectedTable}...`
          }
          className="flex-1 bg-stone-950 border border-stone-700 rounded-2xl px-3.5 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl shadow transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
