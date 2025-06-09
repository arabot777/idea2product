// lib/openmeter/client.ts
import { OpenMeter } from '@openmeter/sdk';

/**
 * Singleton for the OpenMeter client.
 */
class OpenMeterClient {
  private static instance: OpenMeter | null = null;
  
  /**
   * Retrieves the OpenMeter client instance.
   * @returns The OpenMeter client instance.
   */
  public static getInstance(): OpenMeter {
    if (!this.instance) {
      const baseUrl = process.env.OPENMETER_BASE_URL || 'https://openmeter.cloud';
      const token = process.env.OPENMETER_API_TOKEN||"";
      
      if (!token) {
        throw new Error('OpenMeter API token not found in environment variables');
      }
      
      this.instance = new OpenMeter({
        baseUrl,
        apiKey:token,
      });
    }
    
    return this.instance;
  }
}

export default OpenMeterClient;
