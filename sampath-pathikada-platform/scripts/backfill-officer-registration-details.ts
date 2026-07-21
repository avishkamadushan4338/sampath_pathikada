/**
 * One-time backfill for Economic Development Officer accounts approved before
 * localGovt/electoral/farmers/eduZone/eduDiv/mahaweli were added to the User
 * table and copied on approval — pulls the missing values from their original
 * (approved) registration row, matched by NIC or email. Only fills nulls,
 * never overwrites a value already present on the User row.
 */
import { PrismaClient, UserRole } from "../lib/prisma-client";

const prisma = new PrismaClient();

async function main() {
  const officers = await prisma.user.findMany({
    where: {
      role: UserRole.ECONOMIC_DEVELOPMENT_OFFICER,
      OR: [
        { localGovt: null }, { electoral: null }, { farmers: null },
        { eduZone: null }, { eduDiv: null }, { dsDivision: null }, { gnDivision: null },
      ],
    },
  });

  let updated = 0;

  for (const officer of officers) {
    const reg = await prisma.economicDevelopmentOfficerRegistration.findFirst({
      where: {
        status: "APPROVED",
        OR: [
          ...(officer.nic ? [{ nic: officer.nic }] : []),
          { email: officer.email },
        ],
      },
    });
    if (!reg) {
      console.log(`No approved registration found for ${officer.email} (${officer.id}) — skipped`);
      continue;
    }

    await prisma.user.update({
      where: { id: officer.id },
      data: {
        dsDivision: officer.dsDivision ?? reg.dsDivision,
        gnDivision: officer.gnDivision ?? reg.gnDivision,
        localGovt:  officer.localGovt  ?? reg.localGovt,
        electoral:  officer.electoral  ?? reg.electoral,
        farmers:    officer.farmers    ?? reg.farmers,
        eduZone:    officer.eduZone    ?? reg.eduZone,
        eduDiv:     officer.eduDiv     ?? reg.eduDiv,
        mahaweli:   officer.mahaweli   ?? reg.mahaweli,
      },
    });
    updated++;
    console.log(`Backfilled ${officer.email} (${officer.id})`);
  }

  console.log(`Done. ${updated}/${officers.length} officer account(s) updated.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
