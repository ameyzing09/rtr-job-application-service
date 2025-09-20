import { MigrationInterface, QueryRunner } from 'typeorm';

interface ForeignKeyDescriptor {
  constraintName: string;
  tableName: string;
}

export class RemoveTenantAndUserForeignKeys1758316500910
  implements MigrationInterface
{
  name = 'RemoveTenantAndUserForeignKeys1758316500910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const targets: ForeignKeyDescriptor[] = [
      { tableName: 'jobs', constraintName: 'fk_jobs_tenant_id' },
      {
        tableName: 'applications',
        constraintName: 'fk_applications_tenant_id',
      },
      { tableName: 'applications', constraintName: 'fk_applications_user_id' },
    ];

    for (const target of targets) {
      await this.dropForeignKeyIfExists(queryRunner, target);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await this.tableExists(queryRunner, 'tenants')) {
      await this.addForeignKeyIfMissing(
        queryRunner,
        {
          tableName: 'jobs',
          constraintName: 'fk_jobs_tenant_id',
        },
        'FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      );

      await this.addForeignKeyIfMissing(
        queryRunner,
        {
          tableName: 'applications',
          constraintName: 'fk_applications_tenant_id',
        },
        'FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE',
      );
    }

    const userTable = (await this.tableExists(queryRunner, 'users'))
      ? 'users'
      : (await this.tableExists(queryRunner, 'user'))
        ? 'user'
        : null;

    if (userTable) {
      await this.addForeignKeyIfMissing(
        queryRunner,
        {
          tableName: 'applications',
          constraintName: 'fk_applications_user_id',
        },
        `FOREIGN KEY (\`user_id\`) REFERENCES \`${userTable}\`(\`id\`) ON DELETE SET NULL ON UPDATE CASCADE`,
      );
    }
  }

  private async dropForeignKeyIfExists(
    queryRunner: QueryRunner,
    descriptor: ForeignKeyDescriptor,
  ): Promise<void> {
    const existing = (await queryRunner.query(
      `SELECT CONSTRAINT_NAME as constraintName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
      [descriptor.tableName, descriptor.constraintName],
    )) as ForeignKeyDescriptor[];

    if (existing.length === 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE \`${descriptor.tableName}\` DROP FOREIGN KEY \`${descriptor.constraintName}\``,
    );
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    descriptor: ForeignKeyDescriptor,
    definition: string,
  ): Promise<void> {
    const existing = (await queryRunner.query(
      `SELECT CONSTRAINT_NAME as constraintName FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?`,
      [descriptor.tableName, descriptor.constraintName],
    )) as ForeignKeyDescriptor[];

    if (existing.length > 0) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE \`${descriptor.tableName}\` ADD CONSTRAINT \`${descriptor.constraintName}\` ${definition}`,
    );
  }

  private async tableExists(
    queryRunner: QueryRunner,
    tableName: string,
  ): Promise<boolean> {
    const result = (await queryRunner.query(
      `SELECT TABLE_NAME as tableName FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName],
    )) as Array<{ tableName: string }>;

    return result.length > 0;
  }
}
