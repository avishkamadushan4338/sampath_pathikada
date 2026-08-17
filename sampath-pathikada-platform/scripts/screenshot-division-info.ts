import { chromium } from "playwright";
import { signToken } from "../lib/auth";

const APP_URL = "http://localhost:3004";
const DS_USER = {
  userId: "cmrerncz900027kcg6ndxj4gd",
  email: "avishkamadushan@gmail.com",
  name: "W.G. Avishka Madushan",
  role: "DIVISIONAL_SECRETARIAT",
  dsDivision: "galle-fg",
};

async function main() {
  const browser = await chromium.launch();
  const token = await signToken(DS_USER);
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

  await page.goto(`${APP_URL}/divisional-secretariat/graphs/housing`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.getByText("ප්‍රස්ථාරය", { exact: false }).first().click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(800);

  const heading = page.getByText("වැසිකිලි අවශ්‍යතාවය", { exact: false }).first();
  const card = heading.locator("xpath=ancestor::*[contains(@class,'card-lift')][1]");
  await card.screenshot({ path: "scripts/screenshot-housing-sanitation.png" }).catch(async () => {
    await page.screenshot({ path: "scripts/screenshot-housing-sanitation.png", fullPage: true });
  });
  console.log(`console errors = ${consoleErrors.length ? consoleErrors.join(" | ") : "none"}`);
  await context.close();
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
