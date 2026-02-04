type Listener = () => void;

class EventEmitter {
    private listeners: Record<string, Listener[]> = {};

    on(event: string, listener: Listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return () => {
            this.listeners[event] = this.listeners[event].filter(l => l !== listener);
        };
    }

    emit(event: string) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(listener => listener());
        }
    }
}

export const events = new EventEmitter();
