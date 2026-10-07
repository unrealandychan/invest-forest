import { Router, Request, Response } from 'express';
import { syncService } from '../services/syncService';

export const syncRouter = Router();

syncRouter.post('/push', async (req: Request, res: Response): Promise<void> => {
  try {
    const { syncId, version, encryptedBlob, iv, salt, checksum } = req.body;

    if (!syncId || !encryptedBlob) {
      res.status(400).json({ error: 'syncId and encryptedBlob are mandatory' });
      return;
    }

    const saved = await syncService.saveSnapshot({
      syncId,
      version: typeof version === 'number' ? version : 1,
      encryptedBlob,
      iv: iv || '',
      salt: salt || '',
      checksum: checksum || '',
    });

    res.status(200).json({
      success: true,
      message: 'Encrypted portfolio snapshot stored successfully',
      snapshot: {
        syncId: saved.syncId,
        version: saved.version,
        updatedAt: saved.updatedAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to persist snapshot', message: err.message });
  }
});

syncRouter.get('/pull', async (req: Request, res: Response): Promise<void> => {
  try {
    const syncId = req.query.syncId as string;
    if (!syncId) {
      res.status(400).json({ error: 'syncId query parameter is required' });
      return;
    }

    const snapshot = await syncService.getSnapshot(syncId);
    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found for given syncId' });
      return;
    }

    res.status(200).json({
      success: true,
      snapshot,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve snapshot', message: err.message });
  }
});
