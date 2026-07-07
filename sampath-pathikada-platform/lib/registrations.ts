import prisma from "@/lib/db";

export type TableKey = "gn" | "rs";

export const ROLE_LABELS: Record<TableKey, string> = {
  gn: "Economic Development Officer",
  rs: "Regional Secretary",
};

export const USER_ROLE_MAP: Record<TableKey, "ECONOMIC_DEVELOPMENT_OFFICER" | "REGIONAL_SECRETARY"> = {
  gn: "ECONOMIC_DEVELOPMENT_OFFICER",
  rs: "REGIONAL_SECRETARY",
};

export function findRecord(id: string, tableKey: TableKey) {
  if (tableKey === "gn") return prisma.economicDevelopmentOfficerRegistration.findUnique({ where: { id } });
  return prisma.regionalSecretaryRegistration.findUnique({ where: { id } });
}
