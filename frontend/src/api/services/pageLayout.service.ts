import { apiRequest } from "../client";
import type { PageLayout } from "@/types/pageLayout";

export const pageLayoutService = {
  async get(pageId: string): Promise<PageLayout | null> {
    return apiRequest<PageLayout | null>(`/settings/page-layout/${pageId}`);
  },

  async save(pageId: string, layout: PageLayout): Promise<PageLayout> {
    return apiRequest<PageLayout>(`/settings/page-layout/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify(layout),
    });
  },
};
