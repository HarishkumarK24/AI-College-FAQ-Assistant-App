import React from 'react';
import { MessageSquarePlus, History, Database, ShieldAlert, Sparkles } from 'lucide-react';

export default function Sidebar({ onNewChat, onOpenAdmin, recentQuestions, onSelectQuestion }) {
  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-sky-500 p-2 rounded-lg text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide">Campus AI</h1>
            <p className="text-xs text-slate-400">FAQ & Student Services</p>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2.5 px-4 rounded-xl transition duration-150 shadow-sm"
          >
            <MessageSquarePlus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="px-4 py-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <History size={14} />
            <span>Recent Queries</span>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-64 pr-1">
            {recentQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No recent queries yet</p>
            ) : (
              recentQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuestion(q)}
                  className="w-full text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 px-2.5 py-2 rounded-lg truncate transition"
                >
                  {q}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <Database size={14} className="text-emerald-400" />
          <span>RAG Engine: Active</span>
        </div>
        <button
          onClick={onOpenAdmin}
          className="w-full flex items-center space-x-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 py-2 px-3 rounded-lg border border-slate-700 transition"
        >
          <ShieldAlert size={14} />
          <span>Knowledge Base Admin</span>
        </button>
      </div>
    </aside>
  );
}