import React, { useState, useRef, useEffect } from 'react';
import { Send, FileText, CheckCircle2, AlertCircle, Bot, User } from 'lucide-react';

const SUGGESTIONS = [
  "What is the minimum attendance requirement?",
  "When are the semester examinations?",
  "How can I contact the placement department?",
  "What are the available student clubs?",
  "What are the college working hours?"
];

export default function ChatArea({ messages, onSendMessage, loading, error }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const getConfidenceBadge = (confidence) => {
    if (confidence === "High") {
      return (
        <span className="inline-flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          Knowledge-base relevance: High
        </span>
      );
    }
    if (confidence === "Medium") {
      return (
        <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          Knowledge-base relevance: Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
        Knowledge-base relevance: Low
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-800">College AI Assistant</h2>
          <p className="text-xs text-slate-500">Official RAG-backed factual campus inquiries</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 py-1 px-3 rounded-full">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <span>Zero Hallucination Grounding</span>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto my-12 text-center">
            <div className="inline-flex p-3 bg-sky-100 text-sky-600 rounded-2xl mb-4">
              <Bot size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to Campus FAQ Assistant</h3>
            <p className="text-sm text-slate-600 mb-8">
              Ask any question regarding academic policies, regulations, fees, transport, placements, or campus events.
            </p>

            <div className="text-left">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Suggested Inquiries</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(item)}
                    className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:border-sky-500 hover:text-sky-600 text-left transition shadow-sm"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start max-w-2xl space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-2 rounded-xl text-white ${msg.role === 'user' ? 'bg-slate-800' : 'bg-sky-600'}`}>
                  {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                </div>

                <div className={`rounded-2xl p-4 shadow-sm text-sm ${
                  msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-800'
                }`}>
                  <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>

                  {/* Sources & Confidence block for Bot answers */}
                  {msg.role === 'assistant' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        {getConfidenceBadge(msg.confidence)}
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs font-semibold text-slate-500 flex items-center space-x-1 mb-1">
                            <FileText size={12} />
                            <span>Sources:</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                {src.document}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-600 text-white">
              <Bot size={18} />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-xs text-slate-400 ml-2">Retrieving knowledge base...</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about attendance rules, fee deadlines, exams..."
            className="flex-1 bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white focus:outline-none rounded-xl px-4 py-3 text-sm text-slate-800 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-5 py-3 rounded-xl transition duration-150 flex items-center justify-center shadow-sm"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}