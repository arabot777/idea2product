// lib/di/container.ts
type ServiceIdentifier<T> = string | symbol | (new (...args: any[]) => T);

class DependencyContainer {
  private dependencies = new Map<ServiceIdentifier<any>, any>();

  /**
   * Registers a service or dependency.
   * @param token The unique identifier for the service (string, Symbol, or class constructor).
   * @param implementation The implementation of the service (instance or factory function).
   */
  register<T>(token: ServiceIdentifier<T>, implementation: T | ((container: DependencyContainer) => T)): void {
    if (this.dependencies.has(token)) {
      console.warn(`[DI Container] Service with token '${String(token)}' already registered. Overwriting.`);
    }
    this.dependencies.set(token, implementation);
    console.log(`[DI Container] Registered service: ${String(token)}`);
  }

  /**
   * Resolves and retrieves a service instance.
   * @param token The unique identifier for the service.
   * @returns The service instance.
   * @throws Error if the service is not registered.
   */
  resolve<T>(token: ServiceIdentifier<T>): T {
    const implementation = this.dependencies.get(token);
    if (!implementation) {
      throw new Error(`[DI Container] Service with token '${String(token)}' not found.`);
    }
    if (typeof implementation === 'function' && !(implementation.prototype && implementation.prototype.constructor === implementation)) {
      // If it's a factory function, execute it to get the instance
      return implementation(this);
    }
    // If it's an instance or a class, return it directly
    return implementation;
  }

  /**
   * Checks if a service is registered.
   * @param token The unique identifier for the service.
   * @returns boolean
   */
  has(token: ServiceIdentifier<any>): boolean {
    return this.dependencies.has(token);
  }
}

export const container = new DependencyContainer();