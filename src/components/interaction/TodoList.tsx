import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, Check, Circle, Loader2, ListTodo, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as todosApi from '../../api/todos';
import styles from './TodoList.module.css';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export function TodoList() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    todosApi.getTodos()
      .then((data) => setTodos(data.map((t) => ({ id: t.id, text: t.text, done: t.done }))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const addTodo = useCallback(async () => {
    const text = input.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    try {
      const created = await todosApi.createTodo(text);
      setTodos((prev) => [{ id: created.id, text: created.text, done: created.done }, ...prev]);
      setInput('');
      // Scroll to top to show new item
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
      });
    } catch {
    } finally {
      setSubmitting(false);
    }
  }, [input, submitting]);

  const toggleTodo = useCallback(async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      await todosApi.updateTodo(id, { done: !todo.done });
    } catch {
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: todo.done } : t)));
    }
  }, [todos]);

  const removeTodo = useCallback(async (id: number) => {
    const prev = todos;
    setTodos((cur) => cur.filter((t) => t.id !== id));
    try {
      await todosApi.deleteTodo(id);
    } catch {
      setTodos(prev);
    }
  }, [todos]);

  const clearDone = useCallback(async () => {
    const doneIds = todos.filter((t) => t.done).map((t) => t.id);
    if (doneIds.length === 0) return;
    const prev = todos;
    setTodos((cur) => cur.filter((t) => !t.done));
    try {
      await Promise.all(doneIds.map((id) => todosApi.deleteTodo(id)));
    } catch {
      setTodos(prev);
    }
  }, [todos]);

  if (authLoading) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <ListTodo size={16} />
          待办清单
        </h3>
        <Loader2 size={16} className={styles.spinner} />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>
          <ListTodo size={16} />
          待办清单
        </h3>
        <p className={styles.empty}>请先登录后使用待办清单</p>
      </div>
    );
  }

  const sorted = [...todos].sort((a, b) => Number(a.done) - Number(b.done));
  const doneCount = todos.filter((t) => t.done).length;
  const progress = todos.length > 0 ? (doneCount / todos.length) * 100 : 0;

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        <ListTodo size={16} />
        待办清单
        {todos.length > 0 && (
          <span className={styles.count}>
            {doneCount}/{todos.length}
          </span>
        )}
      </h3>
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder="添加新任务…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addTodo(); }}
          disabled={submitting}
        />
        <button className={styles.addBtn} onClick={addTodo} disabled={!input.trim() || submitting}>
          {submitting ? <Loader2 size={14} className={styles.spinner} /> : <Plus size={15} />}
        </button>
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className={styles.list} ref={listRef}>
        {loading ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : (
          <>
            {sorted.map((todo, i) => (
              <div
                key={todo.id}
                className={`${styles.item} ${todo.done ? styles.done : ''}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <button
                  className={`${styles.check} ${todo.done ? styles.checked : ''}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.done ? <Check size={12} /> : <Circle size={12} />}
                </button>
                <span className={styles.text}>{todo.text}</span>
                <button className={styles.remove} onClick={() => removeTodo(todo.id)}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {todos.length === 0 && (
              <div className={styles.emptyState}>
                <ListTodo size={28} className={styles.emptyIcon} />
                <p className={styles.empty}>暂无任务，添加一条吧</p>
              </div>
            )}
          </>
        )}
      </div>

      {todos.length > 0 && (
        <div className={styles.footer}>
          <span>{doneCount}/{todos.length} 已完成</span>
          {doneCount > 0 && (
            <button className={styles.clearBtn} onClick={clearDone}>
              <Trash2 size={12} />
              清除已完成
            </button>
          )}
        </div>
      )}
    </div>
  );
}
