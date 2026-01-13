class StorageService {
  private inMemoryStorage: Map<string, string> = new Map();
  private useInMemory: boolean = false;

  constructor() {
    this.useInMemory = !this.isLocalStorageAvailable();
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Save data to storage
   */
  save<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      if (this.useInMemory) {
        this.inMemoryStorage.set(key, serialized);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error('Storage save error:', error);
      // Fallback to in-memory
      this.useInMemory = true;
      this.inMemoryStorage.set(key, JSON.stringify(data));
    }
  }

  /**
   * Load data from storage
   */
  load<T>(key: string): T | null {
    try {
      const serialized = this.useInMemory
        ? this.inMemoryStorage.get(key)
        : localStorage.getItem(key);

      if (!serialized) return null;
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error('Storage load error:', error);
      return null;
    }
  }

  /**
   * Remove data from storage
   */
  remove(key: string): void {
    try {
      if (this.useInMemory) {
        this.inMemoryStorage.delete(key);
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    if (this.useInMemory) {
      this.inMemoryStorage.clear();
    } else {
      localStorage.clear();
    }
  }
}

export const storageService = new StorageService();
