import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductCategory1727969586826 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "category" (
                "id" SERIAL NOT NULL, 
                "name" character varying NOT NULL, 
                CONSTRAINT "UQ_category_name" UNIQUE ("name"), 
                CONSTRAINT "PK_category_id" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "Product_Categories" (
                "product_id" integer NOT NULL, 
                "category_id" integer NOT NULL, 
                CONSTRAINT "PK_product_categories" PRIMARY KEY ("product_id", "category_id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "Product_Categories" 
            ADD CONSTRAINT "FK_product_id" FOREIGN KEY ("product_id") 
            REFERENCES "product"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "Product_Categories" 
            ADD CONSTRAINT "FK_category_id" FOREIGN KEY ("category_id") 
            REFERENCES "category"("id") ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Product_Categories" DROP CONSTRAINT "FK_category_id"`);
        await queryRunner.query(`ALTER TABLE "Product_Categories" DROP CONSTRAINT "FK_product_id"`);
        await queryRunner.query(`DROP TABLE "Product_Categories"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }
}

