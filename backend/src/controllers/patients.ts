import { Elysia, t } from "elysia";
import { db } from "../db/index.ts";

export const patientsController = new Elysia({ prefix: "/patients" }).get(
  "/",
  () => db.selectFrom("patients").selectAll().execute(),
  {
    response: {
      200: t.Array(
        t.Object({
          id: t.String(),
        }),
      ),
    },
  },
);
