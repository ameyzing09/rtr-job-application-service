import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPipelineFieldsToApplications1761309840287
  implements MigrationInterface
{
  name = 'AddPipelineFieldsToApplications1761309840287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to applications table
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD \`pipeline_id\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD \`current_stage_index\` int NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD \`tracking_token\` varchar(64) NOT NULL`,
    );

    // Add unique constraint for tracking_token
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD UNIQUE INDEX \`IDX_9d356cb16ab0c8f92c3aebbd28\` (\`tracking_token\`)`,
    );

    // Drop old status index before modifying enum
    await queryRunner.query(
      `DROP INDEX \`idx_app_tenant_status\` ON \`applications\``,
    );

    // Update status enum to include IN_PROGRESS
    await queryRunner.query(
      `ALTER TABLE \`applications\` CHANGE \`status\` \`status\` enum ('PENDING', 'REVIEWED', 'REJECTED', 'HIRED', 'IN_PROGRESS') NOT NULL DEFAULT 'PENDING'`,
    );

    // Create new indexes
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`idx_app_tracking_token\` ON \`applications\` (\`tracking_token\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_app_tenant_created\` ON \`applications\` (\`tenant_id\`, \`created_at\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_app_tenant_pipeline\` ON \`applications\` (\`tenant_id\`, \`pipeline_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_app_tenant_status\` ON \`applications\` (\`tenant_id\`, \`status\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX \`idx_app_tenant_status\` ON \`applications\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_app_tenant_pipeline\` ON \`applications\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_app_tenant_created\` ON \`applications\``,
    );
    await queryRunner.query(
      `DROP INDEX \`idx_app_tracking_token\` ON \`applications\``,
    );

    // Revert status enum
    await queryRunner.query(
      `ALTER TABLE \`applications\` CHANGE \`status\` \`status\` enum ('PENDING', 'REVIEWED', 'REJECTED', 'HIRED') NOT NULL DEFAULT 'PENDING'`,
    );

    // Recreate old index
    await queryRunner.query(
      `CREATE INDEX \`idx_app_tenant_status\` ON \`applications\` (\`tenant_id\`, \`status\`)`,
    );

    // Remove unique constraint
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP INDEX \`IDX_9d356cb16ab0c8f92c3aebbd28\``,
    );

    // Drop new columns
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP COLUMN \`tracking_token\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP COLUMN \`current_stage_index\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP COLUMN \`pipeline_id\``,
    );
  }
}
