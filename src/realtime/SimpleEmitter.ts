type Listener<T> = (payload: T) => void;

export class SimpleEmitter<T> {
  private listeners = new Set<Listener<T>>();

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(payload: T) {
    this.listeners.forEach((l) => l(payload));
  }
}
