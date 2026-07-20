import type { AdmissionFormConfig } from "@/types/admissionForm";

export const DEFAULT_ADMISSION_FORM: AdmissionFormConfig = {
  customFields: [],
  documentSlots: [
    {
      id: "aadhaar",
      label: "Aadhaar Card",
      description: "Government ID proof (PDF or image)",
      required: true,
      accept: "image/*,application/pdf",
    },
    {
      id: "marksheet",
      label: "Previous Marksheet",
      description: "Latest academic record",
      required: false,
      accept: "image/*,application/pdf",
    },
    {
      id: "transfer-cert",
      label: "Transfer Certificate",
      description: "If applicable",
      required: false,
      accept: "image/*,application/pdf",
    },
  ],
};
