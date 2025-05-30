export interface ApiResponse<T=unknown, E=unknown>{
    success: boolean;
    meta?: {
        code?: string;
        message?: string;
    };
    data: T | null;
    error: E | null;
}