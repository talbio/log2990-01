export class ModalManagerSingleton {
    private static instance: ModalManagerSingleton;
    private isModalActive: boolean;
    private constructor() {
        this.isModalActive = false;
    }
    static getInstance() {
        if (!ModalManagerSingleton.instance) {
            ModalManagerSingleton.instance = new ModalManagerSingleton();
        }

        return ModalManagerSingleton.instance;
    }
    set _isModalActive(state: boolean) {
        this.isModalActive = state;
    }
    get _isModalActive(): boolean {
        return this.isModalActive;
    }
}
