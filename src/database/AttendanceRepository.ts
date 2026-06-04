import { getDatabase } from './sqlite';
import type { AttendanceRecord } from '../types/Attendance';

export class AttendanceRepository {

    static save(record: AttendanceRecord): void {
        const db = getDatabase();
        db.execute(
            'INSERT INTO attendance (id, employee_id, employee_name, confidence, timestamp) VALUES (?, ?, ?, ?, ?)',
            [record.id, record.employeeId, record.employeeName, record.confidence, record.timestamp]
        );
    }

    static getAll(): AttendanceRecord[] {
        const db = getDatabase();
        const result = db.execute('SELECT * FROM attendance ORDER BY timestamp DESC LIMIT 200');
        return result.rows._array.map((row: any) => ({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            confidence: row.confidence,
            timestamp: row.timestamp,
            synced: row.synced,
        }));
    }

    static deleteAll(): void {
        getDatabase().execute('DELETE FROM attendance');
    }
}
