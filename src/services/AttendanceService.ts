import { AttendanceRepository } from '../database/AttendanceRepository';
import { UserRepository } from '../database/UserRepository';
import { cosineSimilarity } from '../utils/similarity';
import type { Employee } from '../types/Employee';
import type { AttendanceRecord } from '../types/Attendance';

const MATCH_THRESHOLD = 0.6;

export interface MatchResult {
    matched: boolean;
    employee?: Employee;
    confidence: number;
}

export class AttendanceService {

    static findBestMatch(embedding: number[]): MatchResult {
        const employees = UserRepository.getAll();

        if (employees.length === 0) {
            return { matched: false, confidence: 0 };
        }

        let bestEmployee: Employee | undefined;
        let bestScore = -1;

        for (const emp of employees) {
            const score = cosineSimilarity(embedding, emp.embedding);
            if (score > bestScore) {
                bestScore = score;
                bestEmployee = emp;
            }
        }

        if (bestScore >= MATCH_THRESHOLD && bestEmployee) {
            return { matched: true, employee: bestEmployee, confidence: bestScore };
        }

        return { matched: false, confidence: bestScore };
    }

    static recordAttendance(match: MatchResult): AttendanceRecord | null {
        if (!match.matched || !match.employee) return null;

        const record: AttendanceRecord = {
            id: Date.now().toString(),
            employeeId: match.employee.id,
            employeeName: match.employee.name,
            confidence: match.confidence,
            timestamp: new Date().toISOString(),
            synced: 0,
        };

        AttendanceRepository.save(record);
        return record;
    }
}
