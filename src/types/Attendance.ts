export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    confidence: number;
    timestamp: string;
    latitude: number | null;
    longitude: number | null;
    syncStatus: number; // 0 = pending, 1 = synced
}
