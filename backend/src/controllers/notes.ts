import { Elysia, status, t } from "elysia";

import { tryCatch } from "@/lib/tryCatch";

import { db } from "../db/index.ts";
import { uploadAudio } from "../lib/s3";
import { structureAsSOAP } from "../lib/soap.ts";
import { transcribeAudio } from "../lib/transcribe";

const patientSchema = t.Object({
  id: t.String(),
  name: t.String(),
  mrn: t.String(),
  dob: t.Date(),
  gender: t.String(),
  address: t.Nullable(t.String()),
  phone: t.Nullable(t.String()),
  insuranceId: t.Nullable(t.String()),
  insuranceProvider: t.Nullable(t.String()),
  emergencyContactName: t.Nullable(t.String()),
  emergencyContactPhone: t.Nullable(t.String()),
  primaryPhysician: t.Nullable(t.String()),
  createdAt: t.Date(),
});

const noteSchema = t.Object({
  id: t.String(),
  patientId: t.String(),
  rawText: t.Nullable(t.String()),
  processedText: t.Nullable(t.String()),
  audioFilePath: t.Nullable(t.String()),
  createdAt: t.Date(),
  patient: patientSchema,
});

const noteBaseQuery = db
  .selectFrom("notes")
  .innerJoin("patients", "patients.id", "notes.patientId")
  .selectAll("notes")
  .select([
    "patients.id as p_id",
    "patients.name as p_name",
    "patients.mrn as p_mrn",
    "patients.dob as p_dob",
    "patients.gender as p_gender",
    "patients.address as p_address",
    "patients.phone as p_phone",
    "patients.insuranceId as p_insuranceId",
    "patients.insuranceProvider as p_insuranceProvider",
    "patients.emergencyContactName as p_emergencyContactName",
    "patients.emergencyContactPhone as p_emergencyContactPhone",
    "patients.primaryPhysician as p_primaryPhysician",
    "patients.createdAt as p_createdAt",
  ]);

type NoteRow = Awaited<ReturnType<typeof noteBaseQuery.execute>>[number];

function mapNoteRow({
  p_id,
  p_name,
  p_mrn,
  p_dob,
  p_gender,
  p_address,
  p_phone,
  p_insuranceId,
  p_insuranceProvider,
  p_emergencyContactName,
  p_emergencyContactPhone,
  p_primaryPhysician,
  p_createdAt,
  ...note
}: NoteRow) {
  return {
    ...note,
    patient: {
      id: p_id,
      name: p_name,
      mrn: p_mrn,
      dob: p_dob,
      gender: p_gender,
      address: p_address,
      phone: p_phone,
      insuranceId: p_insuranceId,
      insuranceProvider: p_insuranceProvider,
      emergencyContactName: p_emergencyContactName,
      emergencyContactPhone: p_emergencyContactPhone,
      primaryPhysician: p_primaryPhysician,
      createdAt: p_createdAt,
    },
  };
}

export type NoteResponse = ReturnType<typeof mapNoteRow>;

export const notesController = new Elysia({ prefix: "/notes" })
  .post(
    "/",
    async ({ body }) => {
      const { patientId, text, audioBase64 } = body;

      if (!text && !audioBase64) return status(400, "Provide text or audio");

      const patient = await db
        .selectFrom("patients")
        .select("id")
        .where("id", "=", patientId)
        .executeTakeFirst();

      if (!patient) return status(404, "Patient not found");

      let audioFilePath: string | null = null;
      if (audioBase64) {
        const [err, path] = await tryCatch(uploadAudio(audioBase64));
        if (err) return status(500, "Failed to upload audio to storage");
        audioFilePath = path;
      }

      let rawText: string | null = text ?? null;
      if (audioBase64) {
        const [err, transcript] = await tryCatch(transcribeAudio(audioBase64));
        if (err) return status(500, "Failed to transcribe audio");
        rawText = transcript;
      }

      let processedText: string | null = null;
      if (rawText) {
        const [err, soap] = await tryCatch(structureAsSOAP(rawText));
        if (err) return status(500, "Failed to structure note");
        processedText = soap;
      }

      const [dbErr, row] = await tryCatch(
        db
          .insertInto("notes")
          .values({ patientId, rawText, processedText, audioFilePath })
          .returningAll()
          .executeTakeFirstOrThrow(),
      );

      if (dbErr) return status(500, "Failed to save note");

      const noteRow = await noteBaseQuery.where("notes.id", "=", row.id).executeTakeFirstOrThrow();
      return mapNoteRow(noteRow);
    },
    {
      body: t.Object({
        patientId: t.String(),
        text: t.Optional(t.String()),
        audioBase64: t.Optional(t.String()),
      }),
      response: {
        200: noteSchema,
        400: t.String(),
        404: t.String(),
        500: t.String(),
      },
    },
  )
  .get(
    "/",
    async () => {
      const rows = await noteBaseQuery.orderBy("notes.createdAt", "desc").execute();
      return rows.map(mapNoteRow);
    },
    {
      response: {
        200: t.Array(noteSchema),
      },
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const row = await noteBaseQuery.where("notes.id", "=", params.id).executeTakeFirst();

      if (!row) return status(404, "Note not found");
      return mapNoteRow(row);
    },
    {
      response: {
        200: noteSchema,
        404: t.String(),
      },
    },
  );
