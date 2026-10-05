import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import AdminModal from './components/AdminModal';
import { askQuestion } from './services/api';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);

  const handleSendMessage = async (text) => {
    setError("");
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    
    if (!recentQuestions.includes(text)) {
      setRecentQuestions((prev) => [text, ...prev.slice(0, 9)]);
    }

    setLoading(true);
    try {
      const data = await askQuestion(text);
      const botMsg = {
        role: "assistant",
        content: data.answer,
        sources: data.sources,
        confidence: data.confidence,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || "Failed to contact the knowledge engine.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError("");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar
        onNewChat={handleNewChat}
        onOpenAdmin={() => setAdminOpen(true)}
        recentQuestions={recentQuestions}
        onSelectQuestion={(q) => handleSendMessage(q)}
      />
      <ChatArea
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={loading}
        error={error}
      />
      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />
    </div>
  );
}