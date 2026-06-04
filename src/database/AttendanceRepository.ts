import { getDatabase } from './sqlite';
import type { AttendanceRecord } from '../types/Attendance';

export class AttendanceRepository {

    static save(record: AttendanceRecord): void {
        const db = getDatabase();
        db.execute(
            `INSERT INTO attendance
             (id, employee_id, employee_name, confidence, timestamp, latitude, longitude, syncStatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                record.id,
                record.employeeId,
                record.employeeName,
                record.confidence,
                record.timestamp,
                record.latitude,
                record.longitude,
                record.syncStatus,
            ]
        );
    }

    static getAll(): AttendanceRecord[] {
        const db = getDatabase();
        const result = db.execute(
            'SELECT * FROM attendance ORDER BY timestamp DESC LIMIT 200'
        );
        return result.rows._array.map((row: any) => ({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            confidence: row.confidence,
            timestamp: row.timestamp,
            latitude: row.latitude ?? null,
            longitude: row.longitude ?? null,
            syncStatus: row.syncStatus ?? 0,
        }));
    }

    static getPending(): AttendanceRecord[] {
        const db = getDatabase();
        const result = db.execute(
            'SELECT * FROM attendance WHERE syncStatus = 0 ORDER BY timestamp ASC'
        );
        return result.rows._array.map((row: any) => ({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            confidence: row.confidence,
            timestamp: row.timestamp,
            latitude: row.latitude ?? null,
            longitude: row.longitude ?? null,
            syncStatus: 0,
        }));
    }

    static markSynced(id: string): void {
        getDatabase().execute(
            'UPDATE attendance SET syncStatus = 1 WHERE id = ?',
            [id]
        );
    }

    static deleteSynced(id: string): void {
        getDatabase().execute('DELETE FROM attendance WHERE id = ? and syncStatus = 1', [id]);
    }

    static deleteAll(): void {
        getDatabase().execute('DELETE FROM attendance');
    }
}
