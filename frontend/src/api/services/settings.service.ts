import { apiRequest } from "../client";
import { mapInstituteSettings } from "../mappers";
import type { InstituteSettings } from "@/types";

function institutePayload(patch: Partial<InstituteSettings>) {
  return {
    name: patch.name,
    phone: patch.phone,
    email: patch.email,
    address: patch.address,
    registrationNo: patch.registrationNo,
    academicYear: patch.academicYear,
    logoUrl: patch.logoUrl,
  };
}

export const settingsService = {
  async getBranding() {
    const row = await apiRequest<{ name: string; logoUrl?: string }>("/settings/branding");
    return {
      name: row.name,
      logoUrl: row.logoUrl ?? "",
    };
  },

  async getInstitute() {
    const row = await apiRequest<Record<string, unknown>>("/settings/institute");
    const receipt = await apiRequest<Record<string, unknown>>("/settings/receipt");
    const certificate = await apiRequest<Record<string, unknown>>("/settings/certificate");
    return mapInstituteSettings(row, receipt, certificate);
  },

  async updateInstitute(
    patch: Partial<InstituteSettings>,
    logoFile?: File | null
  ) {
    if (logoFile) {
      const form = new FormData();
      form.append("logo", logoFile);
      const fields = institutePayload(patch);
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) {
          form.append(key, String(value));
        }
      }
      const row = await apiRequest<Record<string, unknown>>("/settings/institute", {
        method: "PATCH",
        body: form,
      });
      return mapInstituteSettings(row);
    }

    const row = await apiRequest<Record<string, unknown>>("/settings/institute", {
      method: "PATCH",
      body: JSON.stringify(institutePayload(patch)),
    });
    return mapInstituteSettings(row);
  },

  async updateReceipt(receipt: InstituteSettings["receipt"]) {
    await apiRequest("/settings/receipt", {
      method: "PATCH",
      body: JSON.stringify(receipt),
    });
  },

  async updateCertificate(certificate: InstituteSettings["certificate"]) {
    await apiRequest("/settings/certificate", {
      method: "PATCH",
      body: JSON.stringify(certificate),
    });
  },
};
