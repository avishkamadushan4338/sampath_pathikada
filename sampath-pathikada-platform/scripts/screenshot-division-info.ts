import { chromium } from "playwright";
import { signToken } from "../lib/auth";

const APP_URL = "http://localhost:3004";
const ADMIN_USER = {
  userId: "cmreg5x2700027k809x9a5l7p",
  email: "avishka@gmail.com",
  name: "Avishka Madushan",
  role: "ADMIN",
  dsDivision: "galle-fg",
};
const DS_USER = {
  userId: "cmrerncz900027kcg6ndxj4gd",
  email: "avishkamadushan@gmail.com",
  name: "W.G. Avishka Madushan",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

async function shot(browser: import("playwright").Browser, user: typeof ADMIN_USER, url: string, outPath: string) {
  const token = await signToken(user);
  const context = await browser.newContext();
  await context.addCookies([
    { name: "sp_session", value: token, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`${outPath}: console errors = ${consoleErrors.length ? consoleErrors.join(" | ") : "none"}`);
  await context.close();
}

async function main() {
  const browser = await chromium.launch();

  await shot(browser, ADMIN_USER, `${APP_URL}/admin/division-information/identification`, "scripts/screenshot-admin-identification.png");
  await shot(browser, DS_USER, `${APP_URL}/divisional-secretariat/graphs/identification`, "scripts/screenshot-ds-identification.png");
  await shot(browser, DS_USER, `${APP_URL}/divisional-secretariat/graphs/social-welfare`, "scripts/screenshot-ds-social-welfare.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
