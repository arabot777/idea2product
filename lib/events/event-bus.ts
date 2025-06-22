/**
 * Defines the event structure interface.
 * All events must conform to this structure.
 */
export interface IEvent {
  name: string;
  payload: any;
}

export type IHandler = (payload: any) => Promise<void>;

/**
 * Defines the event bus interface.
 * Provides methods for publishing, subscribing, and unsubscribing events.
 */
export interface IEventBus {
  /**
   * Publishes an event.
   * @param event The event object to publish.
   * @returns A Promise that resolves when the event is published.
   */
  publish<T extends IEvent>(event: T): Promise<void>;

  /**
   * Subscribes to a specific event name.
   * @param eventName The name of the event to subscribe to.
   * @param callback The callback function to execute when the event is fired.
   */
  subscribe<T extends IEvent>(eventName: T['name'], callback: IHandler): void;

  /**
   * Unsubscribes from a specific event name.
   * @param eventName The name of the event to unsubscribe from.
   * @param callback The callback function to remove.
   */
  unsubscribe<T extends IEvent>(eventName: T['name'], callback: IHandler): void;
}

/**
 * Implements the event bus using direct function calls.
 * Executes all subscribed callbacks immediately.
 */
export class DirectCallEventBus implements IEventBus {
  private subscribers: Map<string, Set<IHandler>> = new Map();

  /**
   * Publishes an event.
   * Executes all subscribed callbacks immediately and resolves the Promise.
   * @param event The event object to publish.
   * @returns A Promise that resolves when all callbacks have been executed.
   */
  public async publish<T extends IEvent>(event: T): Promise<void> {
    console.log("Publish event:", event);
    const callbacks = this.subscribers.get(event.name);
    console.log("Callback count:", callbacks?.size);
    if (callbacks) {
      console.log("Executing callbacks...");
      for (const callback of callbacks) {
        console.log("Executing callback:", callback);
        callback(event.payload).catch((error) => console.error(`Error in event handler for ${event.name}:`, error));
      }
    }
    return Promise.resolve();
  }

  /**
   * Subscribes to a specific event name.
   * Adds the callback function to the set of subscribers for the event name.
   * @param eventName The name of the event to subscribe to.
   * @param callback The callback function to execute when the event is fired.
   */
  public subscribe<T extends IEvent>(eventName: T['name'], callback: IHandler): void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    this.subscribers.get(eventName)?.add(callback);
  }

  /**
   * Unsubscribes from a specific event name.
   * Removes the callback function from the set of subscribers for the event name.
   * @param eventName The name of the event to unsubscribe from.
   * @param callback The callback function to remove.
   */
  public unsubscribe<T extends IEvent>(eventName: T['name'], callback: IHandler): void {
    const callbacks = this.subscribers.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(eventName);
      }
    }
  }
}

/**
 * Exports the singleton instance of the DirectCallEventBus.
 */
export const eventBus = new DirectCallEventBus();


// Imports new handlers
import { wsSyncTaskStatusHandler } from "@/lib/events/handles/ws-sync-task-status";
import { recordTaskDataHandler } from "@/lib/events/handles/record-task-data";
import { revokeTaskCallRecordHandler } from "@/lib/events/handles/revoke-task-call-record";
import { updateTaskHandler } from "@/lib/events/handles/update-task";
import { updateRemainHandler } from "@/lib/events/handles/update-remain";

// Subscribes handlers to events
eventBus.subscribe("task.sync.status", wsSyncTaskStatusHandler);
eventBus.subscribe("task.record.data", recordTaskDataHandler);
eventBus.subscribe("task.revoke.call.record", revokeTaskCallRecordHandler);
eventBus.subscribe("task.update", updateTaskHandler);
eventBus.subscribe("task.update.remain", updateRemainHandler);
