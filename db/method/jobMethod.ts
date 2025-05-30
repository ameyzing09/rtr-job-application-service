import { FindOptions, UpdateOptions, WhereOptions } from 'sequelize';
import jobsModel, { JobAttributes, JobCreationAttributes } from '../models/jobs'

export const create = async (payload: JobCreationAttributes) => await jobsModel.create(payload);
export const fetchOne = async (options: FindOptions<JobAttributes>) => await jobsModel.findOne(options);
export const fetchAll = async (options: FindOptions<JobAttributes>) => await jobsModel.findAll(options);
export const fetchAndCountAll = async (options: FindOptions<JobAttributes>) => await jobsModel.findAndCountAll(options);
export const update = async (payload: Partial<JobAttributes>, options: UpdateOptions<JobAttributes>) => await jobsModel.update(payload, options);
export const remove = async (options: { where: WhereOptions<JobAttributes> }) => await jobsModel.destroy(options);