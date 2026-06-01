import { db } from "../index.ts";
import type { DB } from "../types.ts";
import type { Insertable } from "kysely";

type NewPatient = Insertable<DB["patients"]>;

const patients: NewPatient[] = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Alice Johnson" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Bob Williams" },
  { id: "a0000000-0000-0000-0000-000000000003", name: "Carol Davis" },
];

export const seed = async () => {
  await db
    .insertInto("patients")
    .values(patients)
    .onConflict((oc) => oc.column("id").doNothing())
    .execute();

  console.log(`[seed] Seeded ${patients.length.toString()} patients`);
};
