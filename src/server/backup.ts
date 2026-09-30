import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { appConfig } from './config.ts';

export interface BackupRecord {
  id: string;
  filename: string;
  filepath: string;
  sizeBytes: number;
  createdAt: string;
  label: string;
  sha256: string;
  isValid: boolean;
  environment: string;
  operator: string;
}

export class BackupManager {
  private backupDir: string;
  private dbPath: string;

  constructor() {
    this.backupDir = appConfig.backupDir;
    this.dbPath = appConfig.databasePath;
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Calculate SHA256 checksum of a file
   */
  private calculateChecksum(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Test integrity of a SQLite backup file
   */
  public verifyBackup(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) return false;
      const testDb = new DatabaseSync(filePath);
      const res = testDb.prepare('PRAGMA integrity_check').get() as { integrity_check?: string };
      return res?.integrity_check === 'ok';
    } catch (err) {
      console.error(`[BackupManager] Integrity check failed for ${filePath}:`, err);
      return false;
    }
  }

  /**
   * Create a new point-in-time backup using SQLite VACUUM INTO or atomic copy
   */
  public createBackup(label = 'manual-backup', operator = 'system'): BackupRecord {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `mcu_backup_${appConfig.env}_${timestamp}_${safeLabel}.sqlite`;
    const destPath = path.join(this.backupDir, filename);

    if (!fs.existsSync(this.dbPath)) {
      throw new Error(`Target database file does not exist at: ${this.dbPath}`);
    }

    try {
      // Use live SQLite connection to safely vacuum into the backup file for complete transactional consistency
      const activeDb = new DatabaseSync(this.dbPath);
      // VACUUM INTO writes an exact, compacted, consistent snapshot
      activeDb.exec(`VACUUM INTO '${destPath}'`);
    } catch (vacuumErr) {
      console.warn('[BackupManager] VACUUM INTO not supported or failed, falling back to atomic file copy:', vacuumErr);
      fs.copyFileSync(this.dbPath, destPath);
    }

    const stats = fs.statSync(destPath);
    const sha256 = this.calculateChecksum(destPath);
    const isValid = this.verifyBackup(destPath);

    const record: BackupRecord = {
      id: `bkp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      filename,
      filepath: destPath,
      sizeBytes: stats.size,
      createdAt: new Date().toISOString(),
      label,
      sha256,
      isValid,
      environment: appConfig.env,
      operator,
    };

    // Save metadata json alongside backup
    const metaPath = destPath.replace('.sqlite', '.meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(record, null, 2), 'utf8');

    console.log(`[BackupManager] Backup created successfully: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
    return record;
  }

  /**
   * List all backups in directory sorted by creation date descending
   */
  public listBackups(): BackupRecord[] {
    if (!fs.existsSync(this.backupDir)) return [];

    const files = fs.readdirSync(this.backupDir);
    const sqliteFiles = files.filter((f) => f.endsWith('.sqlite'));

    const records: BackupRecord[] = [];
    for (const f of sqliteFiles) {
      const fullPath = path.join(this.backupDir, f);
      const metaPath = fullPath.replace('.sqlite', '.meta.json');

      if (fs.existsSync(metaPath)) {
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          records.push(meta);
          continue;
        } catch {
          // fallback to manual reading
        }
      }

      try {
        const stats = fs.statSync(fullPath);
        records.push({
          id: `bkp-${f}`,
          filename: f,
          filepath: fullPath,
          sizeBytes: stats.size,
          createdAt: stats.birthtime.toISOString(),
          label: 'unlabeled',
          sha256: 'unknown',
          isValid: true,
          environment: f.includes('prod') ? 'production' : f.includes('staging') ? 'staging' : 'development',
          operator: 'system',
        });
      } catch {
        // ignore unreadable files
      }
    }

    return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Restore database from backup with pre-restore safety snapshot (Rollback protection)
   */
  public restoreBackup(filename: string, operator = 'admin'): { success: boolean; preRestoreBackup: BackupRecord; restoredFile: string } {
    const backupPath = path.join(this.backupDir, filename);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file ${filename} not found in ${this.backupDir}`);
    }

    // Verify target backup validity
    const isValid = this.verifyBackup(backupPath);
    if (!isValid) {
      throw new Error(`Backup file ${filename} is corrupted or failed SQLite PRAGMA integrity_check! Aborting restore.`);
    }

    // 1. Create a PRE-RESTORE safety backup so this restore operation can itself be rolled back if needed!
    console.log('[BackupManager] Creating pre-restore snapshot before applying rollback...');
    const preRestoreBackup = this.createBackup(`pre-restore-rollback-safety-of-${filename}`, operator);

    // 2. Safely replace the active database with the backup
    try {
      fs.copyFileSync(backupPath, this.dbPath);
      console.log(`[BackupManager] Database restored successfully from ${filename} to ${this.dbPath}`);
      return {
        success: true,
        preRestoreBackup,
        restoredFile: filename,
      };
    } catch (err: any) {
      console.error('[BackupManager] Failed to copy backup to active database:', err);
      throw new Error(`Failed to restore database: ${err.message}`);
    }
  }
}

export const backupManager = new BackupManager();
