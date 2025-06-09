export interface WaveSpeedClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

export class WaveSpeedError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly statusCode?: number,
    public readonly response?: any
  ) {
    super(message);
    this.name = 'WaveSpeedError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WaveSpeedError);
    }
  }
}

export class WaveSpeedAPIError extends WaveSpeedError {
  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    response?: any
  ) {
    super(message, code, statusCode, response);
    this.name = 'WaveSpeedAPIError';
  }
}
