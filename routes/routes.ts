import jobRoute from './jobRouter';
import { sendErrorResponse } from '../utils/standardResponse';
import { ERROR_MESSAGES, HTTP_ERRORS } from '../constants/apiConstants';
import express from 'express';
class Routes {
    constructor(private app: express.Application) {
        this.app = app;
    }

    init() {
        this.app.use('/api/jobs', jobRoute);
        //other paths

        this.app.use((req, res) => {
            sendErrorResponse(
                res,
                {},
                ERROR_MESSAGES.NOT_FOUND,
                {},
                HTTP_ERRORS.NOT_FOUND
            )
        })
    }
}

export default Routes;