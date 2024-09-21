import { MigrationInterface, QueryRunner } from "typeorm"

export class PostRefactoringTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE DATABASE ecommerce IF NOT EXISTS`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(
        //     `ALTER TABLE "post" ALTER COLUMN "name" RENAME TO "title"`,
        // )
    }
}