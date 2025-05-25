import Applications from "./applications";
import Job from "./jobs";

Job.hasMany(Applications, {foreignKey: "job_id"});
Applications.belongsTo(Job, {foreignKey: "job_id"});
export { Applications, Job };