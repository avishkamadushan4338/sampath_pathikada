import prisma from "@/lib/db";

export type TableKey = "gn" | "ad" | "ds";

export const ROLE_LABELS: Record<TableKey, string> = {
  gn: "Economic Development Officer",
  ad: "Assistant Director Planning",
  ds: "Divisional Secretariat",
};

export const USER_ROLE_MAP: Record<TableKey, "ECONOMIC_DEVELOPMENT_OFFICER" | "ASSISTANT_DIRECTOR_PLANNING" | "DIVISIONAL_SECRETARIAT"> = {
  gn: "ECONOMIC_DEVELOPMENT_OFFICER",
  ad: "ASSISTANT_DIRECTOR_PLANNING",
  ds: "DIVISIONAL_SECRETARIAT",
};

export function findRecord(id: string, tableKey: TableKey) {
  if (tableKey === "gn") return prisma.economicDevelopmentOfficerRegistration.findUnique({ where: { id } });
  if (tableKey === "ad") return prisma.assistantDirectorPlanningRegistration.findUnique({ where: { id } });
  return prisma.divisionalSecretariatRegistration.findUnique({ where: { id } });
}

