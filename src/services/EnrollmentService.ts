import { UserRepository } from '../database/UserRepository';
import type { Employee } from '../types/Employee';

export class EnrollmentService {

    static enroll(name: string, embedding: number[]): Employee {
        const employee: Employee = {
            id: Date.now().toString(),
            name: name.trim(),
            embedding,
            createdAt: Date.now(),
        };
        UserRepository.save(employee);
        return employee;
    }

    static getAllEmployees(): Employee[] {
        return UserRepository.getAll();
    }
}
