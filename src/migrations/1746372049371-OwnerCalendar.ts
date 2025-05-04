import { MigrationInterface, QueryRunner } from 'typeorm';

export class OwnerCalendar1746372049371 implements MigrationInterface {
  name = 'OwnerCalendar1746372049371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "event" (
        "even_id" SERIAL NOT NULL,
        "evec_lib" character varying(255) NOT NULL,
        "eved_start" date NOT NULL,
        "eved_end" date NOT NULL,
        "usen_id" integer NOT NULL,
        "accn_id" integer NOT NULL,
        CONSTRAINT "PK_0b296f9295eac9e9f5f962f52ce" PRIMARY KEY ("even_id")
      );
    `);
    await queryRunner.query(`
      CREATE TABLE "owner_calendar" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        CONSTRAINT "PK_5840bfc5cffa9cf5a5068cfa659" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "owner_calendar";');
    await queryRunner.query('DROP TABLE "event";');
  }
}
