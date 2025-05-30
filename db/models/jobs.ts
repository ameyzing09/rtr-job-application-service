import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../dbConfig";

// const Job = sequelize.define("jobs", {
//   id: {
//     type: DataTypes.UUID,
//     defaultValue: DataTypes.UUIDV4,
//     primaryKey: true,
//     allowNull: false,
//     },
//     tenant_id: {
//     type: DataTypes.UUID,
//     allowNull: false,
//     },
//     title: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     },
//     description: {
//     type: DataTypes.TEXT,
//     allowNull: true,
//     },
//     location: {
//     type: DataTypes.STRING,
//     allowNull: true,
//     },
// }, {
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
// });

// export default Job;

export interface JobAttributes {
  id: string;
  tenant_id: string;
  title: string;
  description?: string;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}
export interface JobCreationAttributes extends Optional<JobAttributes, 'id'> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: string;
  public tenant_id!: string;
  public title!: string;
  public description?: string;
  public location?: string;
  public created_at!: Date;
  public updated_at!: Date;
}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "jobs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Job;