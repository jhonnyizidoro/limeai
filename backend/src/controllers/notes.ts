import { Elysia, status, t } from "elysia";

import { db } from "../db/index.ts";

export const notesController = new Elysia({ prefix: "/notes" })
  .get(
    "/",
    async () => {
      const res = await db.selectFrom("notes").select("id").execute();
      return res;
    },
    {
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
          }),
        ),
      },
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const res = await db
        .selectFrom("notes")
        .select("id")
        .where("notes.id", "=", params.id)
        .executeTakeFirst();

      if (!res) return status(404, "Note not found");
      return res;
    },
    {
      response: {
        200: t.Object({ id: t.String() }),
        404: t.String(),
      },
    },
  );
