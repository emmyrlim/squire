export type Quest = {
  id: string;
  title: string;
  description: string | null;
  questType: "main" | "side" | "personal";
  campaignId: string;
  createdAt: Date;
  updatedAt: Date;
};
