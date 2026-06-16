import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.APP_URL || "http://localhost:3000";
const OUT_DIR = path.resolve(__dirname, "../docs/screenshots");
const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const PAGES = [
  { name: "login", path: "/login", wait: 1500 },
  { name: "dashboard", path: "/", login: true, wait: 2000 },
  { name: "students", path: "/students", login: true, wait: 1500 },
  { name: "courses", path: "/courses", login: true, wait: 1500 },
  { name: "batches", path: "/batches", login: true, wait: 1500 },
  { name: "attendance", path: "/attendance", login: true, wait: 1500 },
  { name: "fees", path: "/fees", login: true, wait: 1500 },
  { name: "faculty", path: "/faculty", login: true, wait: 1500 },
  { name: "exams", path: "/exams", login: true, wait: 1500 },
  { name: "certificates", path: "/certificates", login: true, wait: 1500 },
  { name: "reports", path: "/reports", login: true, wait: 1500 },
  { name: "notifications", path: "/notifications", login: true, wait: 1500 },
  { name: "settings", path: "/settings", login: true, wait: 1500 },
];

async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle0" });
  await page.type('input[type="email"]', "admin@techacademy.com");
  await page.type('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForFunction(
    () => !window.location.pathname.includes("/login"),
    { timeout: 10000 }
  );
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  let loggedIn = false;

  for (const item of PAGES) {
    if (item.login && !loggedIn) {
      await login(page);
      loggedIn = true;
    }

    await page.goto(`${BASE_URL}${item.path}`, { waitUntil: "networkidle0" });
    await new Promise((r) => setTimeout(r, item.wait));

    const file = path.join(OUT_DIR, `${item.name}.png`);
    await page.screenshot({ path: file });
    console.log(`Saved ${file}`);
  }

  await browser.close();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
