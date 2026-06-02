import type { Insertable } from "kysely";

import { db } from "../index.ts";
import type { DB } from "../types.ts";

type NewPatient = Insertable<DB["patients"]>;
type NewNote = Insertable<DB["notes"]>;

const PATIENT_IDS = {
  alice: "a0000000-0000-0000-0000-000000000001",
  bob: "a0000000-0000-0000-0000-000000000002",
  carol: "a0000000-0000-0000-0000-000000000003",
};

const patients: NewPatient[] = [
  {
    id: PATIENT_IDS.alice,
    mrn: "MRN-001234",
    name: "Alice Johnson",
    dob: "1952-03-14",
    gender: "Female",
    phone: "555-201-0011",
    address: "142 Maple St, Springfield, IL 62701",
    insuranceProvider: "BlueCross BlueShield",
    insuranceId: "BCBS-88291047",
    primaryPhysician: "Dr. Karen Patel",
    emergencyContactName: "Mark Johnson",
    emergencyContactPhone: "555-201-0099",
  },
  {
    id: PATIENT_IDS.bob,
    mrn: "MRN-001235",
    name: "Bob Williams",
    dob: "1948-07-29",
    gender: "Male",
    phone: "555-304-0022",
    address: "87 Oak Avenue, Riverside, CA 92501",
    insuranceProvider: "Aetna",
    insuranceId: "AETNA-77410293",
    primaryPhysician: "Dr. James Lee",
    emergencyContactName: "Susan Williams",
    emergencyContactPhone: "555-304-0077",
  },
  {
    id: PATIENT_IDS.carol,
    mrn: "MRN-001236",
    name: "Carol Davis",
    dob: "1960-11-05",
    gender: "Female",
    phone: "555-407-0033",
    address: "310 Pine Road, Austin, TX 78701",
    insuranceProvider: "UnitedHealth",
    insuranceId: "UHC-55639012",
    primaryPhysician: "Dr. Maria Gonzalez",
    emergencyContactName: "Tom Davis",
    emergencyContactPhone: "555-407-0088",
  },
];

const notes: NewNote[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    patientId: PATIENT_IDS.alice,
    rawText:
      "Patient reports increased shortness of breath over the past two days. Denies chest pain or fever. Currently on lisinopril 10mg daily and metformin 500mg twice daily. Vitals: BP 148/92, HR 88, SpO2 96% on room air. Lungs with mild bilateral crackles at bases.",
    processedText:
      "SUBJECTIVE: Patient reports increased shortness of breath over the past two days. Denies chest pain or fever.\n\nOBJECTIVE: BP 148/92, HR 88, SpO2 96% on room air. Lung exam reveals mild bilateral crackles at bases. Current medications: lisinopril 10mg daily, metformin 500mg twice daily.\n\nASSESSMENT: Possible fluid retention or early congestive heart failure exacerbation. Elevated blood pressure noted.\n\nPLAN: Notify primary physician Dr. Patel of findings. Monitor fluid intake/output. Review medication compliance. Follow-up visit in 48 hours or sooner if symptoms worsen.",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    patientId: PATIENT_IDS.bob,
    rawText:
      "Routine home visit. Patient is alert and oriented. Reports pain level 4 out of 10 in lower back, unchanged from last visit. Wound on left heel is healing, no signs of infection. Dressing changed. Patient performed all ADLs independently today.",
    processedText:
      "SUBJECTIVE: Patient reports lower back pain 4/10, unchanged from previous visit. No new complaints.\n\nOBJECTIVE: Alert and oriented x3. Left heel wound — clean, granulating tissue noted, no erythema, no exudate, no odor. Fresh dressing applied. ADLs performed independently.\n\nASSESSMENT: Wound healing progressing as expected. Chronic lower back pain stable.\n\nPLAN: Continue current wound care protocol. Schedule next dressing change in 3 days. Reinforce back pain management techniques. Encourage ambulation as tolerated.",
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    patientId: PATIENT_IDS.carol,
    rawText:
      "Patient reports she missed two doses of her blood pressure medication this week due to nausea. Blood pressure today is 162 over 98. She has a mild headache. No visual changes, no chest pain. She is eating and drinking adequately.",
    processedText:
      "SUBJECTIVE: Patient reports missing two doses of antihypertensive medication this week secondary to nausea. Complains of mild headache. Denies visual changes, chest pain, or shortness of breath. Adequate oral intake.\n\nOBJECTIVE: BP 162/98 (elevated). Patient appears well, no acute distress.\n\nASSESSMENT: Hypertensive — likely due to medication non-compliance. Headache may be related to elevated BP. Nausea causing adherence barrier.\n\nPLAN: Contact Dr. Gonzalez regarding BP reading and missed doses. Assess cause of nausea — review recent diet and medication side effects. Provide patient education on importance of medication compliance. Recheck BP in 1 hour.",
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    patientId: PATIENT_IDS.alice,
    rawText:
      "Follow-up visit. Patient breathing improved since last visit. Reports she has been resting and limiting sodium intake as instructed. BP 132 over 84, HR 76, SpO2 98%. Lungs clear to auscultation bilaterally. No pedal edema noted.",
    processedText:
      "SUBJECTIVE: Patient reports improved breathing since last visit. Has been adherent to sodium restriction and rest.\n\nOBJECTIVE: BP 132/84 (improved), HR 76, SpO2 98% on room air. Lungs clear to auscultation bilaterally. No peripheral edema.\n\nASSESSMENT: Significant clinical improvement. BP trending toward target range. Respiratory symptoms resolved.\n\nPLAN: Continue current management plan. Reinforce dietary sodium restriction. Next routine visit in 1 week. Contact Dr. Patel with positive update.",
  },
];

export const seed = async () => {
  await db
    .insertInto("patients")
    .values(patients)
    .onConflict((oc) => oc.column("id").doNothing())
    .execute();

  console.log(`[seed] Seeded ${patients.length.toString()} patients`);

  await db
    .insertInto("notes")
    .values(notes)
    .onConflict((oc) => oc.column("id").doNothing())
    .execute();

  console.log(`[seed] Seeded ${notes.length.toString()} notes`);
};
