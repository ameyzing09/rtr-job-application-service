import { validationResult, Result, FieldValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, HTTP_ERRORS } from '../constants/apiConstants';
import { sendErrorResponse } from '../utils/standardResponse';

type FormattedValidationError = {
  msg: string;
  path: string;
  location: string;
  value: unknown;
};


const requestValidator = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req) as Result<FieldValidationError>;

  if (!errors.isEmpty()) {
    const formattedErrors: FormattedValidationError[] = errors.array().map((err) => ({
      msg: err.msg,
      path: err.path,
      location: err.location,
      value: err.value,
    }));

    const errorResponse = {
      code: ERROR_MESSAGES.BAD_REQUEST.code,
      message: ERROR_MESSAGES.BAD_REQUEST.message,
      details: formattedErrors,
    };

    return sendErrorResponse(res, errorResponse, {}, HTTP_ERRORS.BAD_REQUEST);
  }

  return next();
};

export default requestValidator;
