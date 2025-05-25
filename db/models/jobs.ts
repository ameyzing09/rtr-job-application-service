import { DataTypes } from "sequelize";
import sequelize from "../dbConfig";

const Job = sequelize.define("jobs", {
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
}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});

export default Job;