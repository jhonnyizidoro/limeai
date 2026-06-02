import { type Kysely, sql } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("patients")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("mrn", "varchar(20)", (col) => col.notNull().unique())
    .addColumn("name", "varchar(255)", (col) => col.notNull())
    .addColumn("dob", "date", (col) => col.notNull())
    .addColumn("gender", "varchar(20)", (col) => col.notNull())
    .addColumn("phone", "varchar(30)")
    .addColumn("address", "varchar(500)")
    .addColumn("insuranceProvider", "varchar(255)")
    .addColumn("insuranceId", "varchar(100)")
    .addColumn("primaryPhysician", "varchar(255)")
    .addColumn("emergencyContactName", "varchar(255)")
    .addColumn("emergencyContactPhone", "varchar(30)")
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("patients").execute();
}
