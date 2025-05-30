import { create as addJobsOpening } from '../db/method/jobMethod'
import { Job } from '../db/models';

interface CreateJobData { title: string; description?: string; location?: string; }


export const createJob = async (tenantId: string, data: CreateJobData): Promise<Job> => {
    return addJobsOpening({
        title: data.title,
        tenant_id: tenantId,
        description: data.description,
        location: data.location
    })
}   