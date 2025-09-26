export declare enum Role {
    ADMIN = "admin",
    BOARD = "board",
    VOTER = "voter"
}
export declare enum ElectionStatus {
    OPEN = "open",
    CLOSED = "closed",
    PENDING = "pending"
}
export interface JwtPayload {
    id: string;
    email: string;
    role: Role;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
