// add controller to handle job-related routes
//add validation to the job routes
import { Router } from 'express';
import {createJobOpening} from '../controller/jobController';

const router = Router();

router.post('/', createJobOpening);

export default router;