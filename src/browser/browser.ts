import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import type { Browser } from "puppeteer";

puppeteer.use(AdblockerPlugin({ blockTrackersAndAnnoyances: true })).use(StealthPlugin());

let browser: Browser | null = null;

export const getBrowserInstance = async (
): Promise<Browser> => {
    if (!browser) {
        browser = await puppeteer.launch({ defaultViewport: { width: 1920, height: 1080 } });
        console.log("Browser instance created.");
    }
    return browser;
}

const setupAutoClose = async (
): Promise<void> => {
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

setupAutoClose();
