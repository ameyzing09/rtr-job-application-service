import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1748684612294 implements MigrationInterface {
  name = 'InitialMigration1748684612294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`jobs\` (\`id\` varchar(36) NOT NULL, \`tenant_id\` varchar(255) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`location\` varchar(255) NULL, \`department\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`jobs\``);
  }
}
