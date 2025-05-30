export class AppError extends Error {
    code: string;
    statusCode: number;

    constructor(code: string, message: string, statusCode: number = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        if(Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
        }
    }
}