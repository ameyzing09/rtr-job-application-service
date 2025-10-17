import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicPostingFields1760699480260 implements MigrationInterface {
  name = 'AddPublicPostingFields1760699480260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD \`is_public\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD \`publish_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD \`expire_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`jobs\` ADD \`external_apply_url\` varchar(255) NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`idx_jobs_public\` ON \`jobs\` (\`tenant_id\`, \`is_public\`, \`publish_at\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`idx_jobs_public\` ON \`jobs\``);
    await queryRunner.query(
      `ALTER TABLE \`jobs\` DROP COLUMN \`external_apply_url\``,
    );
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`expire_at\``);
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`publish_at\``);
    await queryRunner.query(`ALTER TABLE \`jobs\` DROP COLUMN \`is_public\``);
  }
}
