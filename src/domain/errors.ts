export class ApplicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class UserAlreadyExistsError extends ApplicationError {
    constructor() {
        super('Email already exists');
    }
}

export class InvalidCredentialsError extends ApplicationError {
    constructor() {
        super('Invalid credentials');
    }
}