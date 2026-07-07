import { PrismaClient, UserRole, UserStatus } from "../lib/prisma-client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database…");

  // ── Super Admin ────────────────────────────────────────────────────────────
  const email    = process.env.SUPER_ADMIN_EMAIL    ?? "superadmin@sampath.lk";
  const password = process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@2026";
  const hash     = await bcrypt.hash(password, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: {
      email,
      passwordHash:  hash,
      name:          "Super Admin",
      nameSinhala:   "සුපිරි පරිපාලක",
      role:          UserRole.SUPER_ADMIN,
      status:        UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  console.log(`✅  Super Admin: ${superAdmin.email}`);

  // ── Default system settings ────────────────────────────────────────────────
  const defaults: { key: string; value: string }[] = [
    { key: "platform_name_en",          value: "Sampath Pathikada"     },
    { key: "platform_name_si",          value: "සම්පත් පැතිකඩ"        },
    { key: "default_language",          value: "si"                    },
    { key: "timezone",                  value: "Asia/Colombo"          },
    { key: "date_format",               value: "DD/MM/YYYY"            },
    { key: "maintenance_mode",          value: "false"                 },
    { key: "session_timeout_minutes",   value: "480"                   },
    { key: "max_login_attempts",        value: "5"                     },
    { key: "lockout_duration_minutes",  value: "15"                    },
    { key: "password_min_length",       value: "8"                     },
    { key: "require_two_factor",        value: "false"                 },
    { key: "force_password_reset",      value: "true"                  },
    { key: "allow_public_registration", value: "true"                  },
    { key: "require_email_verification",value: "true"                  },
    { key: "auto_backup",               value: "true"                  },
    { key: "backup_frequency",          value: "daily"                 },
    { key: "backup_retention_days",     value: "30"                    },
    { key: "admin_email",               value: "admin@sampath.lk"      },
    { key: "smtp_host",                 value: "smtp.gmail.com"        },
    { key: "smtp_port",                 value: "587"                   },
  ];

  for (const s of defaults) {
    await prisma.systemSetting.upsert({
      where:  { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log(`✅  ${defaults.length} system settings seeded`);
  console.log("🎉  Seed complete!");
}

main()
  .catch((e) => { console.error("❌  Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
