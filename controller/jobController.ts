import { Request, Response } from "express";

import { createJob } from "../services/jobService";
import { sendErrorResponse, sendSuccessResponse } from "../utils/standardResponse";
import { ERROR_MESSAGES, HTTP_ERRORS, HTTP_SUCCESS, SUCCESS_MESSAGES } from "../constants/apiConstants";
import { AppError } from "../lib/error";

const createJobOpening = async (req: Request, res: Response) => {
    const { tenantId } = req;
    const { title, description, location } = req.body;
    if (!tenantId) {
  return sendErrorResponse(res, {}, ERROR_MESSAGES.TENANT_NOT_FOUND, {}, HTTP_ERRORS.NOT_FOUND);
}
    try {
        const createdJob = await createJob(tenantId,{
            title,
            description,
            location
        });
        return sendSuccessResponse(res, createdJob, SUCCESS_MESSAGES.JOB_CREATED, {}, HTTP_SUCCESS.CREATED);
    } catch (error) {
        if(error instanceof AppError) {
            return sendErrorResponse(res, {}, { code: error.code, message: error.message }, {}, error.statusCode);
        }
        console.error('Error creating job:', error);
        return sendErrorResponse(res, {}, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, {}, HTTP_ERRORS.INTERNAL_SERVER_ERROR);
    }
}

export {
    createJobOpening
};