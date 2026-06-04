import { getDatabase } from './sqlite';
import type { Employee } from '../types/Employee';

export class UserRepository {

    static save(employee: Employee): void {
        const db = getDatabase();
        db.execute(
            'INSERT OR REPLACE INTO employees (id, name, embedding, createdAt) VALUES (?, ?, ?, ?)',
            [employee.id, employee.name, JSON.stringify(employee.embedding), employee.createdAt.toString()]
        );
    }

    static getAll(): Employee[] {
        const db = getDatabase();
        const result = db.execute('SELECT * FROM employees ORDER BY createdAt DESC');
        return result.rows._array.map((row: any) => ({
            id: row.id,
            name: row.name,
            embedding: JSON.parse(row.embedding),
            createdAt: Number(row.createdAt),
        }));
    }

    static count(): number {
        const db = getDatabase();
        const result = db.execute('SELECT COUNT(*) as total FROM employees');
        return (result.rows._array[0] as any)?.total ?? 0;
    }

    static deleteAll(): void {
        getDatabase().execute('DELETE FROM employees');
    }
}
