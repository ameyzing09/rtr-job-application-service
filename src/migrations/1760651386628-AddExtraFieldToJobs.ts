import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtraFieldToJobs1760651386628 implements MigrationInterface {
  name = 'AddExtraFieldToJobs1760651386628';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP FOREIGN KEY \`fk_applications_job\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP FOREIGN KEY \`fk_applications_tenant\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` DROP FOREIGN KEY \`fk_jobs_tenant\``,
    );
    await queryRunner.query(`ALTER TABLE \`jobs\` ADD \`extra\` json NULL`);
    await queryRunner.query(
      `CREATE INDEX \`idx_app_tenant_status\` ON \`applications\` (\`tenant_id\`, \`status\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_app_job\` ON \`applications\` (\`job_id\`)`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_jobs_tenant_title\` ON \`jobs\` (\`tenant_id\`, \`title\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD CONSTRAINT \`FK_8aba14d7f098c23ba06d8693235\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD CONSTRAINT \`fk_applications_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD CONSTRAINT \`fk_jobs_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_8aba14d7f098c23ba06d8693235\``,
    );
    await queryRunner.query(`DROP INDEX \`idx_jobs_tenant_title\` ON \`jobs\``);
    await queryRunner.query(`DROP INDEX \`idx_app_job\` ON \`applications\``);
    await queryRunner.query(
      `DROP INDEX \`idx_app_tenant_status\` ON \`applications\``,
    );
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`extra\``);
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD CONSTRAINT \`fk_jobs_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD CONSTRAINT \`fk_applications_tenant\` FOREIGN KEY (\`tenant_id\`) REFERENCES \`tenants\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD CONSTRAINT \`fk_applications_job\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
