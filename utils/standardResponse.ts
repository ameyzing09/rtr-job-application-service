import { Response } from 'express';
import { ApiResponse } from '../types/apiResponse';

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
  meta: { code?: string; message?: string } = {},
  headers: Record<string, string> = {},
  statusCode: number = 200
): void {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  const responseBody: ApiResponse<T> = { success: true, data, error: null, meta };
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
  meta: { code?: string; message?: string } = {},
  headers: Record<string, string> = {},
  statusCode: number = 500
): void {
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  const responseBody: ApiResponse<null, E> = { success: false, data: null, error, meta };
  res.status(statusCode).json(responseBody);
}