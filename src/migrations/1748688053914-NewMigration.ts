import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1748688053914 implements MigrationInterface {
  name = 'NewMigration1748688053914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`applications\` (\`id\` varchar(36) NOT NULL, \`tenant_id\` varchar(255) NOT NULL, \`job_id\` varchar(255) NOT NULL, \`applicant_name\` varchar(255) NOT NULL, \`applicant_email\` varchar(255) NOT NULL, \`applicant_phone\` varchar(255) NULL, \`resume_url\` varchar(255) NULL, \`cover_letter\` text NULL, \`status\` enum ('PENDING', 'REVIEWED', 'REJECTED', 'HIRED') NOT NULL DEFAULT 'PENDING', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`applications\` ADD CONSTRAINT \`FK_8aba14d7f098c23ba06d8693235\` FOREIGN KEY (\`job_id\`) REFERENCES \`jobs\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`applications\` DROP FOREIGN KEY \`FK_8aba14d7f098c23ba06d8693235\``,
    );
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`created_at\``);
    await queryRunner.query(`DROP TABLE \`applications\``);
  }
}
