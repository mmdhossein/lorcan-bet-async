import { MigrationInterface, QueryRunner } from "typeorm"

export class PostRefactoringTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "title" RENAME TO "name"`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "name" RENAME TO "title"`,
        )
    }
}