export type AdmissionFieldType = "text" | "textarea" | "date" | "number" | "select";

export type AdmissionCustomField = {
  id: string;
  label: string;
  placeholder?: string;
  type: AdmissionFieldType;
  required: boolean;
  options?: string[];
};

export type AdmissionDocumentSlot = {
  id: string;
  label: string;
  description?: string;
  required: boolean;
  accept?: string;
};

export type AdmissionFormConfig = {
  customFields: AdmissionCustomField[];
  documentSlots: AdmissionDocumentSlot[];
};

export type StudentDocument = {
  slotId: string;
  label: string;
  fileName: string;
  url: string;
  uploadedAt: string;
};

export type StudentExtraData = {
  customFields?: Record<string, string>;
  documents?: StudentDocument[];
};
