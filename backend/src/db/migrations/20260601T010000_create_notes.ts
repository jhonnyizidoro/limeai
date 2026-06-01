import { sql, type Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("notes")
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("patientId", "uuid", (col) =>
      col.notNull().references("patients.id").onDelete("cascade"),
    )
    .addColumn("rawText", "text")
    .addColumn("processedText", "text")
    .addColumn("audioFilePath", "varchar(500)")
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("notes").execute();
}
