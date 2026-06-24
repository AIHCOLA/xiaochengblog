import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as chatHistoryApi from '../../api/chatHistory';
import styles from './AIChat.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function AIChat() {
  const { isLoggedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    chatHistoryApi.getHistory()
      .then((data) => {
        const msgs: Message[] = data.map((m) => ({
          id: String(m.id),
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.timestamp).getTime(),
        }));
        setMessages(msgs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = {
      id: `local-${Date.now().toString(36)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // Save user message to backend
    if (isLoggedIn) {
      chatHistoryApi.saveMessage('user', text).catch(() => {});
    }

    try {
      const token = localStorage.getItem('blog-jwt-token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const reply = data.data?.reply || data.reply || '抱歉，我暂时无法回答。';

      const aiMsg: Message = {
        id: `local-${(Date.now() + 1).toString(36)}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Save AI reply to backend
      if (isLoggedIn) {
        chatHistoryApi.saveMessage('assistant', reply).catch(() => {});
      }
    } catch {
      const fallback: Message = {
        id: `local-${(Date.now() + 1).toString(36)}`,
        role: 'assistant',
        content: '无法连接到 AI 服务，请确保后端已启动。',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setSending(false);
    }
  }, [input, sending, isLoggedIn]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (isLoggedIn) {
      chatHistoryApi.clearHistory().catch(() => {});
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <Bot size={16} />
          AI助手
        </h3>
        <p className={styles.needLogin}>请先登录后使用 AI 助手</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <Bot size={16} />
          AI助手
        </h3>
        <div className={styles.chatList} style={{ textAlign: 'center', padding: '24px' }}>
          <Loader2 size={20} className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <Bot size={16} />
          AI助手
        </h3>
        {messages.length > 0 && (
          <button className={styles.clearBtn} onClick={clearChat}>清空</button>
        )}
      </div>

      <div className={styles.chatList} ref={listRef}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <Bot size={32} className={styles.emptyIcon} />
            <p>有什么问题尽管问我</p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`${styles.msg} ${msg.role === 'user' ? styles.userMsg : styles.aiMsg}`}>
            <div className={styles.msgAvatar}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={styles.msgContent}>
              {msg.role === 'assistant' ? (
                <div className={styles.markdown}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className={`${styles.msg} ${styles.aiMsg}`}>
            <div className={styles.msgAvatar}>
              <Bot size={14} />
            </div>
            <div className={styles.msgContent}>
              <Loader2 size={16} className={styles.spinner} />
            </div>
          </div>
        )}
      </div>

      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="输入消息..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          disabled={sending}
        />
        <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim() || sending}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
