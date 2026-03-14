import { Router, Request, Response } from 'express';
import { all, get, run, ClipboardItemRow } from '../db';

const router = Router();

function extractUrl(content: string): string | null {
  const urlPattern = /https?:\/\/[^\s]+/i;
  const match = content.match(urlPattern);
  return match ? match[0] : null;
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await all<ClipboardItemRow>(
      'SELECT * FROM clipboard_items ORDER BY created_at DESC'
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load items' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const { content, title, url, tags, state } = req.body;

  if (!content) {
    res.status(400).json({ error: 'content is required' });
    return;
  }

  try {
    const detectedUrl = url || extractUrl(content) || null;
    const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : tags || '[]';
    const now = new Date().toISOString();

    const result = await run(
      `
        INSERT INTO clipboard_items (content, title, url, tags, state, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [content, title || null, detectedUrl, tagsStr, state || 'inbox', now, now]
    );

    const item = await get<ClipboardItemRow>(
      'SELECT * FROM clipboard_items WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

export default router;
