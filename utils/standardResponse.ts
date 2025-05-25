import { Response } from 'express';

export interface ApiResponse<T, E = string> {
  data: T | null;
  error: E | null;
}

/**
 * Sends success response with data.
 * @param res - Express response object
 * @param data - Data to send in the response
 * @param statusCode - HTTP status code (default: 200)
 * @param headers - Additional headers to include in the response
 */

export function sendSuccessResponse<T>(
  res: Response,
  data: T,
  headers: Record<string, string> = {},
  statusCode: number = 200
): void {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  const responseBody: ApiResponse<T> = { data, error: null };
  res.status(statusCode).json(responseBody);
}

/**
 * Sends error response with error message.
 * @param res - Express response object
 * @param error - Error message to send in the response
 * @param statusCode - HTTP status code (default: 500)
 * @param headers - Additional headers to include in the response
 */

export function sendErrorResponse<E = string>(
  res: Response,
  error: E,
  headers: Record<string, string> = {},
  statusCode: number = 500
): void {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  const responseBody: ApiResponse<null, E> = { data: null, error };
  res.status(statusCode).json(responseBody);
}