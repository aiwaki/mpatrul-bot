import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import type { Browser } from "puppeteer";

puppeteer.use(AdblockerPlugin({ blockTrackersAndAnnoyances: true })).use(StealthPlugin());

let browser: Browser | null = null;

async function getBrowserInstance(): Promise<Browser> {
    if (!browser) {
        browser = await puppeteer.launch({ headless: false });
        console.log("Browser instance created.");
    }
    return browser;
}

async function setupAutoClose(): Promise<void> {
    const closeBrowser = async () => {
        if (browser) {
            await browser.close();
            console.log("Browser instance closed.");
        }
    };

    process.on("SIGINT", closeBrowser);
    process.on("SIGTERM", closeBrowser);
    process.on("exit", closeBrowser);
}

export async function screenshotPage(url: string): Promise<File> {
    const browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        Referer: "https://ya.ru/",
    });

    try {
        await page.goto(url, { waitUntil: "networkidle2" });

        const screenshotData = await page.screenshot({ fullPage: true });
        return new File([new Uint8Array(screenshotData)], "screenshot.png", { type: "image/png" });
    } finally {
        await page.close();
    }
}

setupAutoClose();
