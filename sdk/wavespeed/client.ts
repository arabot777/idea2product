import * as https from "https";
import { URL } from "url";
import { WaveSpeedAPIError, WaveSpeedClientOptions, RequestOptions, WaveSpeedResponse, ModelResult } from "./types";
import { BaseRequest } from "./base";

export class WaveSpeedClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  /**
   * Text-to-speech service
   */

  constructor(options: WaveSpeedClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || "https://api.wavespeed.ai";
    this.timeout = options.timeout || 30000;
  }

  /**
   * Make a GET request
   */
  public async get<T = any>(path: string, options: RequestOptions = {}): Promise<WaveSpeedResponse<T>> {
    return this._request("GET", path, undefined, options);
  }

  /**
   * Make a POST request
   */
  public async post<T = any>(path: string, data?: BaseRequest<any>, options: RequestOptions = {}): Promise<WaveSpeedResponse<T>> {
    return this._request("POST", path, data, options);
  }

  public async postModelCall(data: BaseRequest<any>, options: RequestOptions = {}): Promise<WaveSpeedResponse<ModelResult>> {
    return this.post(`/api/v3/${data.getModelUuid()}`, data, options);
  }

  public async getTaskStatus(taskId: string): Promise<WaveSpeedResponse<ModelResult>> {
    return this.get(`/api/v3/predictions/${taskId}/result`);
  }

  /**
   * Make an HTTP request to the API
   */
  private async _request<T = any>(
    method: string,
    endpoint: string,
    requestData?: BaseRequest<any>,
    options: RequestOptions = {}
  ): Promise<WaveSpeedResponse<T>> {
    // Validate request data if provided
    if (requestData) {
      const { success, error } = requestData.safeValidate();
      if (!success) {
        throw new WaveSpeedAPIError("Request validation failed", "VALIDATION_ERROR", 400, { errors: error?.errors || [] });
      }
    }

    const url = new URL(endpoint, this.baseUrl);
    if (options.params) {
      for (const key in options.params) {
        if (Object.prototype.hasOwnProperty.call(options.params, key)) {
          url.searchParams.append(key, options.params[key]);
        }
      }
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...options.headers,
    };

    const requestBody = requestData ? JSON.stringify(requestData.toJSON()) : "";

    const requestOptions: https.RequestOptions = {
      method: method,
      headers: headers,
      timeout: options.timeout || this.timeout,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(url, requestOptions, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const parsedData = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              const errorMessage = parsedData?.message || "Unknown error";
              const errorCode = parsedData?.code || "UNKNOWN_ERROR";
              reject(new WaveSpeedAPIError(errorMessage, errorCode, res.statusCode, parsedData));
            }
          } catch (parseError) {
            reject(new WaveSpeedAPIError("Failed to parse response", "PARSE_ERROR", res.statusCode, data));
          }
        });
      });

      req.on("error", (error) => {
        reject(new WaveSpeedAPIError(error.message || "Request error", "REQUEST_ERROR"));
      });

      if (requestBody && (method === "POST" || method === "PUT")) {
        req.write(requestBody);
      }

      req.end();
    });
  }
}
