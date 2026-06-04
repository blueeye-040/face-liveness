import { open } from 'react-native-nitro-sqlite';
import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite';

let db: NitroSQLiteConnection | null = null;

export function getDatabase(): NitroSQLiteConnection {
    if (db) return db;

    db = open({ name: 'face_auth.db' });

    db.execute(`
        CREATE TABLE IF NOT EXISTS employees (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            embedding TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    `);

    db.execute(`
        CREATE TABLE IF NOT EXISTS attendance (
            id TEXT PRIMARY KEY,
            employee_id TEXT NOT NULL,
            employee_name TEXT NOT NULL,
            confidence REAL NOT NULL,
            timestamp TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            syncStatus INTEGER DEFAULT 0
        )
    `);

    // Migration: add columns if upgrading from older schema
    try { db.execute('ALTER TABLE attendance ADD COLUMN latitude REAL'); } catch {}
    try { db.execute('ALTER TABLE attendance ADD COLUMN longitude REAL'); } catch {}
    try { db.execute('ALTER TABLE attendance ADD COLUMN syncStatus INTEGER DEFAULT 0'); } catch {}

    return db;
}
