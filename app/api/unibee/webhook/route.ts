import { NextResponse } from 'next/server';

// Define known event types
type UnibeeEventType =
  // Subscription events
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.auto_renew.success'
  | 'subscription.auto_renew.failure'
  | 'subscription.cancelled'
  | 'subscription.expired'
  | 'subscription.failed'
  // Invoice events
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.process'
  | 'invoice.cancelled'
  | 'invoice.failed'
  // Subscription pending update events
  | 'subscription.pending_update.create'
  | 'subscription.pending_update.success'
  | 'subscription.pending_update.cancelled'
  // One-time addon events
  | 'subscription.onetime_addon.created'
  | 'subscription.onetime_addon.success'
  | 'subscription.onetime_addon.cancelled'
  | 'subscription.onetime_addon.expired';

// Event categories
const EVENT_CATEGORIES = {
  SUBSCRIPTION: 'subscription',
  INVOICE: 'invoice',
  PENDING_UPDATE: 'subscription.pending_update',
  ONETIME_ADDON: 'subscription.onetime_addon',
} as const;

// Event handler function type
type EventHandler = (event: any) => Promise<void> | void;

// Event handlers mapping
const eventHandlers: Record<string, EventHandler> = {
  // Subscription event handler
  [EVENT_CATEGORIES.SUBSCRIPTION]: async (event) => {
    console.log(`[Unibee Webhook] Handling subscription event: ${event.eventType}`, event);
    // Add subscription event handling logic here
  },
  
  // Invoice event handler
  [EVENT_CATEGORIES.INVOICE]: async (event) => {
    console.log(`[Unibee Webhook] Handling invoice event: ${event.eventType}`, event);
    // Add invoice event handling logic here
  },
  
  // Pending update event handler
  [EVENT_CATEGORIES.PENDING_UPDATE]: async (event) => {
    console.log(`[Unibee Webhook] Handling pending update event: ${event.eventType}`, event);
    // Add pending update event handling logic here
  },
  
  // One-time addon event handler
  [EVENT_CATEGORIES.ONETIME_ADDON]: async (event) => {
    console.log(`[Unibee Webhook] Handling one-time addon event: ${event.eventType}`, event);
    // Add one-time addon event handling logic here
  },
};

export const dynamic = 'force-dynamic';

/**
 * Handle Unibee Webhook requests
 * Note: This endpoint only accepts POST requests and does not include webhook signature verification
 */
export async function POST(request: Request) {
  try {
    // Get request body
    const event = await request.json();
    
    // Get event type from request body
    const eventType = event.eventType as UnibeeEventType | undefined;
    
    if (!eventType) {
      // Return plain text "success" with 200 status code
      return new NextResponse("success", { status: 200 });
    }
    
    // Log received webhook event
    console.log(`[Unibee Webhook] Received event: ${eventType}`, {
      eventId: event.eventId,
      eventType,
      timestamp: new Date().toISOString(),
      payload: event
    });

    // Select handler based on event type
    let handler: EventHandler | null = null;
    
    if (eventType.startsWith(EVENT_CATEGORIES.SUBSCRIPTION)) {
      // Check if it's a pending update or one-time addon event
      if (eventType.startsWith(EVENT_CATEGORIES.PENDING_UPDATE)) {
        handler = eventHandlers[EVENT_CATEGORIES.PENDING_UPDATE];
      } else if (eventType.startsWith(EVENT_CATEGORIES.ONETIME_ADDON)) {
        handler = eventHandlers[EVENT_CATEGORIES.ONETIME_ADDON];
      } else {
        handler = eventHandlers[EVENT_CATEGORIES.SUBSCRIPTION];
      }
    } else if (eventType.startsWith(EVENT_CATEGORIES.INVOICE)) {
      handler = eventHandlers[EVENT_CATEGORIES.INVOICE];
    }

    // Execute handler if exists
    if (handler) {
      try {
        await handler({
          ...event,
          eventType,
          receivedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error(`[Unibee Webhook] Error processing event ${eventType}:`, error);
        // Continue execution, don't interrupt the request
      }
    } else {
      console.warn(`[Unibee Webhook] No handler found for event type: ${eventType}`);
    }

    // Return plain text "success" with 200 status code
    return new NextResponse("success", { status: 200 });
    
  } catch (error) {
    console.error('[Unibee Webhook] Error processing request:', error);
    // Even if there's an error, return "success" with 200 status code to prevent Unibee from retrying
    return new NextResponse("success", { status: 200 });
  }
}
