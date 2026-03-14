import { useState, useEffect, useCallback } from 'react';
import './App.css';

interface ClipboardItem {
  id: number;
  content: string;
  title: string | null;
  url: string | null;
  tags: string;
  state: string;
  created_at: string;
  updated_at: string;
}

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function parseTags(tags: string): string[] {
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/items');
    const data = await res.json();
    setItems(data);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const detectedUrl = URL_PATTERN.test(content.trim()) ? content.trim() : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), title: title.trim() || undefined, tags }),
      });
      if (!res.ok) throw new Error('Failed to create item');
      setContent('');
      setTitle('');
      setTagsInput('');
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Clipboard Inbox</h1>
      </header>

      <main className="app-main">
        <section className="capture-section">
          <form onSubmit={handleSubmit} className="capture-form">
            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste a URL, note, or snippet..."
                rows={3}
                required
              />
              {detectedUrl && (
                <p className="url-hint">URL detected: {detectedUrl}</p>
              )}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Title (optional)</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Optional title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags (optional, comma-separated)</label>
                <input
                  id="tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. read-later, work"
                />
              </div>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={submitting || !content.trim()}>
              {submitting ? 'Saving...' : 'Add to Inbox'}
            </button>
          </form>
        </section>

        <section className="items-section">
          <h2>Inbox ({items.length})</h2>
          {items.length === 0 ? (
            <p className="empty">No items yet. Add something above!</p>
          ) : (
            <ul className="items-list">
              {items.map((item) => {
                const tags = parseTags(item.tags);
                return (
                  <li key={item.id} className="item-card">
                    <div className="item-header">
                      {item.title && <h3 className="item-title">{item.title}</h3>}
                      <span className={`state-badge state-${item.state}`}>{item.state}</span>
                    </div>
                    <p className="item-content">{item.content}</p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="item-url"
                      >
                        {item.url}
                      </a>
                    )}
                    {tags.length > 0 && (
                      <div className="item-tags">
                        {tags.map((tag) => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="item-date">{formatDate(item.created_at)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
