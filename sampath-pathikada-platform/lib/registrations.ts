import prisma from "@/lib/db";

export type TableKey = "gn" | "ds";

export const ROLE_LABELS: Record<TableKey, string> = {
  gn: "Economic Development Officer",
  ds: "Divisional Secretariat",
};

export const USER_ROLE_MAP: Record<TableKey, "ECONOMIC_DEVELOPMENT_OFFICER" | "DIVISIONAL_SECRETARIAT"> = {
  gn: "ECONOMIC_DEVELOPMENT_OFFICER",
  ds: "DIVISIONAL_SECRETARIAT",
};

export function findRecord(id: string, tableKey: TableKey) {
  if (tableKey === "gn") return prisma.economicDevelopmentOfficerRegistration.findUnique({ where: { id } });
  return prisma.divisionalSecretariatRegistration.findUnique({ where: { id } });
}
