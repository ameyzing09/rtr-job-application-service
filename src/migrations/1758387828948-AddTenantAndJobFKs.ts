import { MigrationInterface, QueryRunner } from 'typeorm';

interface ForeignKeyDefinition {
  tableName: string;
  constraintName: string;
  definition: string;
  existingConstraintsToDrop?: string[];
}

export class AddTenantAndJobFKs1758387828948 implements MigrationInterface {
  name = 'AddTenantAndJobFKs1758387828948';

  private readonly foreignKeys: ForeignKeyDefinition[] = [
    {
      tableName: 'jobs',
      constraintName: 'fk_jobs_tenant',
      definition:
        'FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    },
    {
      tableName: 'applications',
      constraintName: 'fk_applications_tenant',
      definition:
        'FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    },
    {
      tableName: 'applications',
      constraintName: 'fk_applications_job',
      definition:
        'FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      existingConstraintsToDrop: ['FK_8aba14d7f098c23ba06d8693235'],
    },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const fk of this.foreignKeys) {
      if (fk.existingConstraintsToDrop) {
        for (const name of fk.existingConstraintsToDrop) {
          await this.dropForeignKeyIfExists(queryRunner, fk.tableName, name);
        }
      }

      await this.addForeignKeyIfMissing(queryRunner, fk);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const fk of [...this.foreignKeys].reverse()) {
      await this.dropForeignKeyIfExists(
        queryRunner,
        fk.tableName,
        fk.constraintName,
      );
    }

    await this.addForeignKeyIfMissing(queryRunner, {
      tableName: 'applications',
      constraintName: 'FK_8aba14d7f098c23ba06d8693235',
      definition:
        'FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
    });
  }

  private async dropForeignKeyIfExists(
    queryRunner: QueryRunner,
    tableName: string,
    constraintName: string,
  ): Promise<void> {
    const existing = (await queryRunner.query(
      `SELECT CONSTRAINT_NAME as constraintName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [tableName, constraintName],
    )) as Array<{ constraintName: string }>;

    if (!existing.length) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${constraintName}\``,
    );
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    fk: ForeignKeyDefinition,
  ): Promise<void> {
    const existing = (await queryRunner.query(
      `SELECT CONSTRAINT_NAME as constraintName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
      [fk.tableName, fk.constraintName],
    )) as Array<{ constraintName: string }>;

    if (existing.length) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE \`${fk.tableName}\` ADD CONSTRAINT \`${fk.constraintName}\` ${fk.definition}`,
    );
  }
}
