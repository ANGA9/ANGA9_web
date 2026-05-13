"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Loader2, Minus, Maximize2, AlertCircle, Check, Paperclip } from 'lucide-react';
import { chatbotApi, ChatSession, ChatMessage, ChatbotEvent } from '@/lib/chatbotApi';

interface ChatWidgetProps {
  surface: 'customer' | 'seller';
}

export default function ChatWidget({ surface }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<(ChatMessage & { requiresConfirmation?: boolean })[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const primaryColor = surface === 'seller' ? '#6C47FF' : '#1A6FD4';
  const bgColor = surface === 'seller' ? 'bg-[#6C47FF]' : 'bg-[#1A6FD4]';

  // Initialize session when opened
  useEffect(() => {
    if (isOpen && !session) {
      initSession();
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initSession = async () => {
    setIsTyping(true);
    try {
      const sess = await chatbotApi.createSession(surface);
      setSession(sess);
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm the ANGA Assistant. How can I help you today?`,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Failed to init session', err);
    } finally {
      setIsTyping(false);
    }
  };

  const escalate = async () => {
    if (!session) return;
    setIsTyping(true);
    try {
      const res = await chatbotApi.escalateSession(session.id);
      setSession({ ...session, escalated_ticket_id: res.ticket_id });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `You have been escalated to human support. Ticket #${res.ticket_id} has been created.`,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !session || isTyping || session.escalated_ticket_id) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userText, 
      created_at: new Date().toISOString() 
    }]);
    setIsTyping(true);

    let currentMsgId = Date.now().toString() + '_ast';
    let currentText = '';
    
    setMessages(prev => [...prev, { 
      id: currentMsgId, 
      role: 'assistant', 
      content: '', 
      created_at: new Date().toISOString() 
    }]);

    await chatbotApi.streamMessage(
      session.id,
      userText,
      (event) => handleStreamEvent(event, () => currentMsgId, (id) => { currentMsgId = id; }, () => currentText, (text) => { currentText = text; }),
      () => { setIsTyping(false); setTimeout(() => inputRef.current?.focus(), 100); },
      (err) => { 
        setIsTyping(false); 
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'error', content: 'Connection error.', created_at: new Date().toISOString() } as any]);
      }
    );
  };

  const confirmAction = async (toolName: string, args: any) => {
    if (!session || isTyping) return;
    setIsTyping(true);
    
    // Add user message acknowledging the confirmation
    setMessages(prev => [...prev, { 
      id: Date.now().toString(), 
      role: 'user', 
      content: `Confirmed action: ${toolName}`, 
      created_at: new Date().toISOString() 
    }]);

    let currentMsgId = Date.now().toString() + '_ast';
    let currentText = '';
    
    setMessages(prev => [...prev, { 
      id: currentMsgId, 
      role: 'assistant', 
      content: '', 
      created_at: new Date().toISOString() 
    }]);

    await chatbotApi.confirmAction(
      session.id,
      toolName,
      args,
      (event) => handleStreamEvent(event, () => currentMsgId, (id) => { currentMsgId = id; }, () => currentText, (text) => { currentText = text; }),
      () => { setIsTyping(false); },
      (err) => { setIsTyping(false); }
    );
  };

  const handleStreamEvent = (
    event: ChatbotEvent, 
    getMsgId: () => string, 
    setMsgId: (id: string) => void, 
    getText: () => string, 
    setText: (text: string) => void
  ) => {
    const currentMsgId = getMsgId();
    let currentText = getText();

    if (event.type === 'text') {
      currentText += event.delta;
      setText(currentText);
      setMessages(prev => {
        // If the current message isn't text (e.g. it's a tool call), create a new text message
        const last = prev[prev.length - 1];
        if (last && last.id === currentMsgId && last.tool_name) {
          const newId = Date.now().toString() + '_ast_txt';
          setMsgId(newId);
          return [...prev, { id: newId, role: 'assistant', content: currentText, created_at: new Date().toISOString() }];
        }
        return prev.map(m => m.id === currentMsgId ? { ...m, content: currentText } : m);
      });
    } else if (event.type === 'tool_call') {
      const newId = Date.now().toString() + '_tool';
      setMsgId(newId);
      setText(''); // Reset text for potential subsequent text events
      setMessages(prev => [...prev, { 
        id: newId, 
        role: 'assistant', 
        content: '', 
        tool_name: event.toolCall.name, 
        tool_input: event.toolCall.args,
        requiresConfirmation: event.toolCall.requiresConfirmation,
        created_at: new Date().toISOString() 
      }]);
    } else if (event.type === 'tool_result') {
      // Find the tool message and update it
      setMessages(prev => prev.map(m => 
        (m.tool_name === event.toolResult.name && m.tool_output === undefined)
          ? { ...m, tool_output: event.toolResult.output || { error: event.toolResult.error } } 
          : m
      ));
      // Prepare for next text chunk
      const newId = Date.now().toString() + '_ast2';
      setMsgId(newId);
      setText('');
      setMessages(prev => [...prev, { id: newId, role: 'assistant', content: '', created_at: new Date().toISOString() }]);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl text-white hover:scale-105 transition-transform z-50 ${bgColor}`}
      >
        <MessageSquare size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 z-50 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className={`p-4 text-white flex items-center justify-between shadow-sm ${bgColor}`}>
        <div className="flex items-center gap-2">
          <MessageSquare size={20} />
          <h3 className="font-semibold text-lg">ANGA Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            
            {msg.role === 'system' ? (
              <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full mx-auto font-medium">
                {msg.content}
              </div>
            ) : msg.tool_name ? (
              // Tool Message UI
              <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm max-w-[85%]">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Loader2 size={14} className={msg.tool_output ? "" : "animate-spin text-blue-500"} />
                  {msg.requiresConfirmation ? 'Proposed Action' : 'Checking information...'}
                </div>
                
                {msg.requiresConfirmation && !msg.tool_output ? (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-3 border-l-2 border-purple-400 pl-2 bg-purple-50/50 py-1">
                      Action: <span className="font-semibold text-purple-700">{msg.tool_name}</span>
                    </p>
                    <button 
                      onClick={() => confirmAction(msg.tool_name!, msg.tool_input)}
                      disabled={isTyping}
                      className="w-full bg-black text-white text-sm font-medium py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Confirm Action
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 font-mono bg-gray-50 p-2 rounded truncate">
                    {msg.tool_name}(...) {msg.tool_output ? '✓' : ''}
                  </div>
                )}
              </div>
            ) : (
              // Standard Chat Bubble
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                msg.role === 'user' 
                  ? `${bgColor} text-white rounded-br-sm` 
                  : msg.role === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-sm'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
              }`}>
                {msg.content ? (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                ) : msg.role === 'assistant' && idx === messages.length - 1 ? (
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                ) : null}
              </div>
            )}
          </div>
        ))}
        {isTyping && !messages.find(m => m.id.endsWith('_ast') && m.content === '') && (
           <div className="flex justify-start">
             <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <Loader2 size={16} className="animate-spin text-gray-400" />
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer & Input */}
      {session?.escalated_ticket_id ? (
        <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-2">This session is closed.</p>
          <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
             View Ticket #{session.escalated_ticket_id}
          </a>
        </div>
      ) : (
        <div className="p-4 bg-white border-t border-gray-100">
          {!session?.escalated_ticket_id && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {['Where is my order?', 'Talk to human', 'Request payout'].map((chip, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    if (chip === 'Talk to human') escalate();
                    else setInput(chip);
                  }}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
          <div className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              disabled={isTyping}
              className={`w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:opacity-50 ${surface === 'seller' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'}`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`absolute right-2 p-1.5 rounded-lg text-white transition-all disabled:opacity-50 ${bgColor}`}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
