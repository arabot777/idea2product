/**
 * Event Bus Module
 * Provides an event communication mechanism between modules within the application.
 */

// Event handler type
type EventHandler = (payload: any) => void;

// Event structure interface
export interface AppEvent<T = any> {
  type: string;        // Event type
  source: string;      // Event source module
  timestamp: number;   // Event timestamp
  payload: T;          // Event data
}

// Event bus implementation
class EventBus {
  private handlers: Record<string, EventHandler[]> = {};
  
  /**
   * Subscribes to an event.
   * @param eventName The name of the event.
   * @param handler The event handler.
   * @returns A function to unsubscribe.
   */
  on(eventName: string, handler: EventHandler): () => void {
    if (!this.handlers[eventName]) {
      this.handlers[eventName] = [];
    }
    
    this.handlers[eventName].push(handler);
    
    // Returns a function to unsubscribe
    return () => this.off(eventName, handler);
  }
  
  /**
   * Unsubscribes from an event.
   * @param eventName The name of the event.
   * @param handler The event handler.
   */
  off(eventName: string, handler: EventHandler): void {
    if (!this.handlers[eventName]) {
      return;
    }
    
    this.handlers[eventName] = this.handlers[eventName].filter(
      h => h !== handler
    );
  }
  
  /**
   * Emits an event.
   * @param eventName The name of the event.
   * @param payload The event data.
   */
  emit<T = any>(eventName: string, payload: T, source: string): void {
    // Create standard event object
    const event: AppEvent<T> = {
      type: eventName,
      source,
      timestamp: Date.now(),
      payload,
    };
    
    // If there are no handlers for this event, return.
    if (!this.handlers[eventName]) {
      return;
    }
    
    // Call all handlers
    this.handlers[eventName].forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Event handler error (${eventName}):`, error);
      }
    });
  }
  
  /**
   * Subscribes to an event once.
   * @param eventName The name of the event.
   * @param handler The event handler.
   */
  once(eventName: string, handler: EventHandler): void {
    const onceHandler = (payload: any) => {
      handler(payload);
      this.off(eventName, onceHandler);
    };
    
    this.on(eventName, onceHandler);
  }
  
  /**
   * Clears all handlers for a specific event.
   * @param eventName The name of the event.
   */
  clear(eventName: string): void {
    delete this.handlers[eventName];
  }
  
  /**
   * Clears all event handlers.
   */
  clearAll(): void {
    this.handlers = {};
  }
}

// Create singleton instance
export const eventBus = new EventBus();

// Event naming convention example
export const AUTH_EVENTS = {
  LOGIN_SUCCESS: 'auth:login:success',
  LOGIN_FAILED: 'auth:login:failed',
  LOGOUT_SUCCESS: 'auth:logout:success',
  REGISTER_SUCCESS: 'auth:register:success',
  REGISTER_FAILED: 'auth:register:failed',
  PASSWORD_RESET_REQUESTED: 'auth:password:resetRequested',
  PASSWORD_RESET_COMPLETED: 'auth:password:resetCompleted',
  PASSWORD_CHANGED: 'auth:password:changed',
  SESSION_REFRESHED: 'auth:session:refreshed',
  PROFILE_UPDATED: 'auth:profile:updated',
};

export const PAYMENT_EVENTS = {
  SUBSCRIPTION_CREATED: 'payment:subscription:created',
  SUBSCRIPTION_UPDATED: 'payment:subscription:updated',
  SUBSCRIPTION_CANCELLED: 'payment:subscription:cancelled',
  PAYMENT_SUCCEEDED: 'payment:charge:succeeded',
  PAYMENT_FAILED: 'payment:charge:failed',
};

export const BILLING_EVENTS = {
  USAGE_RECORDED: 'billing:usage:recorded',
  QUOTA_EXCEEDED: 'billing:quota:exceeded',
  INVOICE_CREATED: 'billing:invoice:created',
};

export const TOOL_EVENTS = {
  EXECUTION_STARTED: 'tool:execution:started',
  EXECUTION_COMPLETED: 'tool:execution:completed',
  EXECUTION_FAILED: 'tool:execution:failed',
};
