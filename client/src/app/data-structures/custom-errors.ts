export class LocalOpenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LocalOpenError';
    }
    // INVALID_NUMBER_OF_FILES,
    // INVALID_FILE_TYPE,
    // INVALID_JSON_CONTENT,
}
