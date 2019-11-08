export class LocalOpenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LocalOpenError';
    }
}
