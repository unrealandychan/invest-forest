export interface EncryptedSnapshot {
  syncId: string;
  version: number;
  encryptedBlob: string;
  iv: string;
  salt: string;
  checksum: string;
  updatedAt: string;
}

export class SyncService {
  private snapshots: Map<string, EncryptedSnapshot> = new Map();

  public async saveSnapshot(data: Omit<EncryptedSnapshot, 'updatedAt'>): Promise<EncryptedSnapshot> {
    if (!data.syncId || !data.encryptedBlob) {
      throw new Error('syncId and encryptedBlob are required');
    }

    const snapshot: EncryptedSnapshot = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.snapshots.set(data.syncId, snapshot);
    return snapshot;
  }

  public async getSnapshot(syncId: string): Promise<EncryptedSnapshot | null> {
    const found = this.snapshots.get(syncId);
    return found || null;
  }

  public clear(): void {
    this.snapshots.clear();
  }
}

export const syncService = new SyncService();
