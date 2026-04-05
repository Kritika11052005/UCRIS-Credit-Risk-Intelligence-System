"use client";

import React, { useState, useEffect } from "react";
import { Send, Bot, User, Trash2, PlusCircle, Lightbulb, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getConversationsAction,
  getConversationMessagesAction,
  runChatAction,
  deleteConversationAction
} from "@/app/actions";

type Message = { role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; last_message: string; updated_at: string };

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Load initial conversation list
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setHistoryLoading(true);
      const data = await getConversationsAction();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    setLoading(true);
    try {
      const history = await getConversationMessagesAction(id);
      setMessages(history.map((h: any) => ({
        role: h.role,
        content: h.content
      })));
    } catch (err) {
      console.error("Failed to load thread", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleDeleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteConversationAction(id);
      if (activeConversationId === id) handleNewChat();
      loadConversations();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const newMessages: Message[] = [...messages, { role: "user", content: userMsg }];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await runChatAction(userMsg, activeConversationId || undefined);

      // If it was a new chat, update the active ID and refresh history
      if (!activeConversationId) {
        setActiveConversationId(res.conversation_id);
      }

      setMessages([...newMessages, { role: "assistant", content: res.answer }]);
      loadConversations(); // Refresh sidebar
    } catch (err) {
      console.error("Chat error", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error processing that request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 top-[72px] right-0 bottom-0 left-[240px] flex bg-[#0D0D0D]">
      {/* Left History Panel */}
      <div className="w-[320px] bg-[#111111] border-r border-[#1F1F1F] flex flex-col pt-6 pb-4">
        <div className="px-6 mb-6">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-primary/30 text-primary bg-primary/10 hover:bg-primary hover:text-inverse font-semibold transition-colors shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          >
            <PlusCircle size={16} /> New Chat
          </button>
        </div>

        <div className="px-4 flex flex-col gap-2 overflow-y-auto">
          <p className="text-xs font-mono text-muted-text font-semibold uppercase px-2 mb-2">Portfolio History</p>

          {historyLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-text" size={20} />
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => selectConversation(conv.id)}
                  className={`text-left px-4 py-3 rounded-xl border transition-all relative min-h-[72px] group ${activeConversationId === conv.id
                      ? 'bg-surface border-primary/30'
                      : 'bg-transparent border-transparent hover:bg-white/5'
                    }`}
                >
                  <h4 className="text-sm font-semibold text-primary-text mb-1 truncate pr-6">{conv.title}</h4>
                  <p className="text-xs text-secondary-text truncate pr-6 italic">{conv.last_message || "No messages yet"}</p>
                  <button
                    aria-label="button"
                    onClick={(e) => handleDeleteChat(e, conv.id)}
                    className="absolute top-4 right-4 text-muted-text opacity-0 group-hover:opacity-100 transition-opacity hover:text-risk-critical"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.button>
              ))}
            </AnimatePresence>
          )}

          {!historyLoading && conversations.length === 0 && (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-muted-text">No previous analysis found. Start a new chat to begin.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-8 glow-orange">
              <Bot size={32} />
            </div>
            <h2 className="font-display font-medium text-2xl text-primary-text mb-2 text-center">Ask me anything about your portfolio</h2>
            <p className="text-secondary-text text-sm mb-12 text-center max-w-md">The UCRIS assistant is powered by Gemini 1.5 and securely grounded in your proprietary NeonDB data.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
              <button onClick={() => setInput("Why is customer C-001 flagged as High stress?")} className="glass p-5 rounded-xl text-left group hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <Lightbulb size={18} className="text-primary mb-3" />
                <p className="text-sm text-primary-text">"Why is customer C-001 flagged as High stress?"</p>
              </button>
              <button onClick={() => setInput("Which customers need immediate restructuring?")} className="glass p-5 rounded-xl text-left group hover:border-risk-critical/40 hover:bg-risk-critical/5 transition-colors">
                <Lightbulb size={18} className="text-risk-critical mb-3" />
                <p className="text-sm text-primary-text">"Which customers need immediate restructuring?"</p>
              </button>
              <button onClick={() => setInput("Explain what pay_delay_trend means in the context of Task A")} className="glass p-5 rounded-xl text-left group hover:border-secondary/40 hover:bg-secondary/5 transition-colors">
                <Lightbulb size={18} className="text-secondary mb-3" />
                <p className="text-sm text-primary-text">"Explain what pay_delay_trend means in the context of Task A"</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col pb-[120px]">
            {messages.map((m, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-[#1F1F1F] text-primary-text' : 'bg-primary/20 border border-primary/30 text-primary'
                    }`}>
                    {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={`p-4 text-[15px] leading-relaxed rounded-2xl ${m.role === 'user'
                      ? 'bg-primary/10 border border-primary/30 text-primary-text rounded-tr-sm'
                      : 'bg-surface border border-[#1F1F1F] text-secondary-text rounded-tl-sm'
                    }`}>
                    {m.content}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-4 max-w-[80%]">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <Bot size={14} className="animate-bounce" />
                </div>
                <div className="p-4 bg-surface border border-[#1F1F1F] rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="text-xs text-muted-text italic">Analyzing portfolio data...</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-base via-base to-transparent flex justify-center">
          <div className="w-full max-w-4xl relative group">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Chat with the UCRIS AI..."
              className="w-full bg-[#171717] border border-[#1F1F1F] rounded-2xl pl-5 pr-14 py-4 min-h-[60px] max-h-[200px] overflow-y-auto text-primary-text font-sans focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-xl resize-none"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              title="Send message"
              aria-label="Send message"
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${input.trim() && !loading ? 'bg-primary text-inverse shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-[#1F1F1F] text-muted-text'
                }`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className={input.trim() ? "translate-x-[-1px] translate-y-[-1px]" : ""} />}
            </button>
            <div className="absolute -bottom-5 right-4 text-[10px] text-muted-text font-mono">
              Cmd + Enter to send
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
