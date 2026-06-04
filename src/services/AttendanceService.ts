import Geolocation from '@react-native-community/geolocation';
import { Alert, Linking, Platform } from 'react-native';
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

interface Coords {
    latitude: number;
    longitude: number;
}

function getCurrentCoords(): Promise<Coords | null> {
    return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
        );
    });
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

    static async recordAttendance(match: MatchResult): Promise<AttendanceRecord | null> {
        if (!match.matched || !match.employee) return null;

        const coords = await getCurrentCoords();

        const record: AttendanceRecord = {
            id: Date.now().toString(),
            employeeId: match.employee.id,
            employeeName: match.employee.name,
            confidence: match.confidence,
            timestamp: new Date().toISOString(),
            latitude: coords?.latitude ?? null,
            longitude: coords?.longitude ?? null,
            syncStatus: 0,
        };

        AttendanceRepository.save(record);

        console.log('[ATTENDANCE]', record.employeeName,
            coords ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : 'no GPS');

        return record;
    }
}
