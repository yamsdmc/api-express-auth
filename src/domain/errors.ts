import * as console from "node:console";

export class ApplicationError extends Error {
    public readonly code: string;
    public readonly status: number;

    constructor(message: string, code: string, status: number) {
        console.log('je suis dans le constructeur de ApplicationError');
        console.log('message', message);
        console.log('code', code);
        console.log('status', status);
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.status = status;
    }
}

export class UserAlreadyExistsError extends ApplicationError {
    constructor() {
        super('Email already exists', 'AUTH_001', 409);
    }
}

export class InvalidCredentialsError extends ApplicationError {
    constructor() {
        super('Invalid credentials', 'AUTH_002', 401);
    }
}

export class TokenExpiredError extends ApplicationError {
    constructor() {
        super('Token expired', 'AUTH_003', 401);
    }
}

export class InvalidTokenError extends ApplicationError {
    constructor() {
        super('Invalid token', 'AUTH_004', 401);
    }
}

export class EmailNotVerifiedError extends ApplicationError {
    constructor() {
        console.log('je suis dans le constructeur de EmailNotVerifiedError');
        super('Email not verified', 'AUTH_005', 403);
    }
}