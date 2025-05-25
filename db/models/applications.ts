import { DataTypes } from "sequelize";
import sequelize from "../dbConfig";

const Applications = sequelize.define("applications", {
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
    job_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    applicant_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    applicant_email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    applicant_phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resume_url: {
        type: DataTypes.STRING(255),
    },
    cover_letter: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'REVIEWED', 'REJECTED', 'HIRED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },

}, {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
});
export default Applications;