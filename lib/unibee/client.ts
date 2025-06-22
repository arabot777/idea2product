import {
  UnibeePlanListResponse,
  UnibeePaymentTimelineListResponse,
  UnibeeClientSessionResponse,
  UnibeeUserSubscriptionResponse,
  UnibeeNewMetricRequest,
  UnibeeNewMetricResponse,
  UnibeeNewMetricEventRequest,
  UnibeeDeleteMetricEventRequest,
  UnibeeDeleteMetricEventResponse,
  UnibeeNewMetricEventResponse,
  UnibeeUserMetricRequest,
  UnibeeUserMetricResponse,
  UnibeeDeleteMetricRequest,
  UnibeeDeleteMetricResponse,
} from "@/lib/types/unibee";

/**
 * Simple Unibee client for handling HTTP requests.
 * Automatically converts request parameters based on the method (GET or POST) and parses JSON responses.
 */
export class UnibeeClient {
  private static _instance: UnibeeClient;
  private baseUrl: string;
  private apiKey: string;

  /**
   * Constructor.
   * @param baseUrl Base URL for the API.
   * @param apiKey API key.
   */
  private constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get the singleton instance of UnibeeClient.
   * @param baseUrl Base URL for the API.
   * @param apiKey API key.
   * @returns Singleton instance of UnibeeClient.
   */
  public static getInstance(): UnibeeClient {
    if (!UnibeeClient._instance) {
      const baseUrl = process.env.UNIBEE_API_BASE_URL || "https://api.unibee.top";
      const apiKey = process.env.UNIBEE_API_KEY || "";

      if (!baseUrl || !apiKey) {
        throw new Error('Unibee API base URL or API key not found in environment variables');
      }
      UnibeeClient._instance = new UnibeeClient(baseUrl, apiKey);
    }
    return UnibeeClient._instance;
  }

  /**
   * Send HTTP request.
   * @param method Request method ('GET' or 'POST').
   * @param path Request path, relative to baseUrl.
   * @param params Request parameters object.
   * @returns Parsed JSON response.
   * @throws If request fails or response is not JSON.
   */
  private async request<T>(
    method: 'GET' | 'POST',
    path: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let requestUrl = url;
    const options: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`, // Add API Key to request header
      },
    };

    if (method === 'GET') {
      // For GET requests, convert parameters to URL query string
      const queryParams = new URLSearchParams(params);
      const queryString = queryParams.toString();
      if (queryString) {
        requestUrl = `${url}?${queryString}`;
      }
    } else if (method === 'POST') {
      // For POST requests, send parameters as JSON body
      options.body = JSON.stringify(params);
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }

    try {
      const response = await fetch(requestUrl, options);

      if (!response.ok) {
        try {
          const data: T = await response.json();
          return data;
        } catch (error) {
          const errorText = await response.text();
          throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
        }
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  /**
   * Fetches a list of Unibee plans.
   * @param params Optional parameters for the plan list request.
   * @returns A promise that resolves to UnibeePlanListResponse.
   */
  public async getPlanList(params?: Record<string, any>): Promise<UnibeePlanListResponse> {
    const unibeeProductId = process.env.UNIBEE_PRODUCT_ID;
    if (unibeeProductId) {
      if (!params) {
        params = {};
      }
      params.productIds = unibeeProductId;
    }
    return this.request<UnibeePlanListResponse>("GET", "/merchant/plan/list", params);
  }

  /**
   * Fetches a list of Unibee payment timelines.
   * @param params Parameters for the payment timeline list request, e.g., userId, createTimeStart.
   * @returns A promise that resolves to UnibeePaymentTimelineListResponse.
   */
  public async getPaymentTimelineList(params: Record<string, any>): Promise<UnibeePaymentTimelineListResponse> {
    return this.request<UnibeePaymentTimelineListResponse>("GET", "/merchant/payment/timeline/list", params);
  }

  /**
   * Creates a new Unibee client session.
   * @param params Parameters for the new session request, e.g., email, externalUserId, cancelUrl, returnUrl.
   * @returns A promise that resolves to UnibeeClientSessionResponse.
   */
  public async createClientSession(params: Record<string, any>): Promise<UnibeeClientSessionResponse> {
    return this.request<UnibeeClientSessionResponse>("POST", "/merchant/session/new_session", params);
  }

  /**
   * Fetches a user's subscription details from Unibee.
   * @param params Parameters for the user subscription detail request, e.g., userId.
   * @returns A promise that resolves to UnibeeUserSubscriptionResponse.
   */
  public async getUserSubscriptionDetail(params: Record<string, any>): Promise<UnibeeUserSubscriptionResponse> {
    const unibeeProductId = process.env.UNIBEE_PRODUCT_ID;
    if (unibeeProductId) {
      if (!params) {
        params = {};
      }
      params.productId = unibeeProductId;
    }
    return this.request<UnibeeUserSubscriptionResponse>("POST", "/merchant/subscription/user_subscription_detail", params);
  }

  /**
   * Creates a new metric in Unibee.
   * @param data The request body for creating a new metric.
   * @returns A promise that resolves to UnibeeNewMetricResponse.
   */
  public async createNewMetric(data: UnibeeNewMetricRequest): Promise<UnibeeNewMetricResponse> {
    const unibeeProductId = process.env.UNIBEE_PRODUCT_ID;
    if (unibeeProductId) {
      data.code = `${unibeeProductId}@${data.code}`;
      data.metricName = `${unibeeProductId}@${data.metricName}`;
    }
    return this.request<UnibeeNewMetricResponse>("POST", "/merchant/metric/new", data);
  }

  /**
   * Creates a new metric event in Unibee.
   * @param data The request body for creating a new metric event.
   * @returns A promise that resolves to UnibeeNewMetricEventResponse.
   */
  public async createNewMetricEvent(data: UnibeeNewMetricEventRequest): Promise<UnibeeNewMetricEventResponse> {
    const unibeeProductId = process.env.UNIBEE_PRODUCT_ID;
    if (unibeeProductId) {
      data.metricCode = `${unibeeProductId}@${data.metricCode}`;
    }
    return this.request<UnibeeNewMetricEventResponse>("POST", "/merchant/metric/event/new", data);
  }

  /**
   * Deletes a metric event in Unibee.
   * @param data The request body for deleting a metric event.
   * @returns A promise that resolves to UnibeeDeleteMetricEventResponse.
   */
    public async deleteMetricEvent(data: UnibeeDeleteMetricEventRequest): Promise<UnibeeDeleteMetricEventResponse> {
      const unibeeProductId = process.env.UNIBEE_PRODUCT_ID;
      if (unibeeProductId) {
        data.metricCode = `${unibeeProductId}@${data.metricCode}`;
      }
      return this.request<UnibeeDeleteMetricEventResponse>("POST", "/merchant/metric/event/delete", data);
    }

  /**
   * Fetches a user's metric data from Unibee.
   * @param params Parameters for the user metric request, e.g., userId or externalUserId.
   * @returns A promise that resolves to UnibeeUserMetricResponse.
   */
  public async getUserMetric(params: UnibeeUserMetricRequest): Promise<UnibeeUserMetricResponse> {
    return this.request<UnibeeUserMetricResponse>("GET", "/merchant/metric/user/metric", params);
  }

  /**
   * Deletes a metric in Unibee.
   * @param data The request body for deleting a metric.
   * @returns A promise that resolves to UnibeeDeleteMetricResponse.
   */
  public async deleteMetric(data: UnibeeDeleteMetricRequest): Promise<UnibeeDeleteMetricResponse> {
    return this.request<UnibeeDeleteMetricResponse>("POST", "/merchant/metric/delete", data);
  }
}