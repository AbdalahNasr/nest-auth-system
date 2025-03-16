/* eslint-disable prettier/prettier */
export interface ThrottlerOptions {
  throttlers: Array<{
    ttl: number;
    limit: number;
  }>;
}
