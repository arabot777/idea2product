/**
 * Simple Unibean client for handling HTTP requests.
 * Automatically converts request parameters based on the method (GET or POST) and parses JSON responses.
 */
export class UnibeanClient {
  private static _instance: UnibeanClient;
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
   * Get the singleton instance of UnibeanClient.
   * @param baseUrl Base URL for the API.
   * @param apiKey API key.
   * @returns Singleton instance of UnibeanClient.
   */
  public static getInstance(): UnibeanClient {
    if (!UnibeanClient._instance) {
      const baseUrl = process.env.UNIBEE_API_BASE_URL || "https://api.unibee.top";
      const apiKey = process.env.UNIBEE_API_KEY || "";

      if (!baseUrl || !apiKey) {
        throw new Error('Unibean API base URL or API key not found in environment variables');
      }
      UnibeanClient._instance = new UnibeanClient(baseUrl, apiKey);
    }
    return UnibeanClient._instance;
  }

  /**
   * Send HTTP request.
   * @param method Request method ('GET' or 'POST').
   * @param path Request path, relative to baseUrl.
   * @param params Request parameters object.
   * @returns Parsed JSON response.
   * @throws If request fails or response is not JSON.
   */
  public async request<T>(
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
      // Build query string from params object
      const queryParams = new URLSearchParams(params);
      // Object.entries(params).forEach(([key, value]) => {
      //   queryParams.append(key, String(value));
      // });
      
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
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      // Try to parse JSON response
      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }
  
  
}
