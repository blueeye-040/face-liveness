export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeName: string;
    confidence: number;
    timestamp: string;
    synced: number;
}
