import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import type { Browser } from "rebrowser-puppeteer-core";
import { connect } from "puppeteer-real-browser";

let browser: Browser | null = null;

export const getBrowserInstance = async (): Promise<Browser> => {
    if (!browser) {
        const connectionResult = await connect({
            args: [
                "--start-maximized",
                '--disable-web-security',
                '--disable-features=SafeBrowsing',
            ],
            turnstile: true,
            headless: false,
            connectOption: {
                defaultViewport: null
            },
            plugins: [
                AdblockerPlugin({ blockTrackersAndAnnoyances: true })
            ]
        });
        browser = connectionResult.browser;
        console.log("Browser instance created.");
    }
    return browser;
}

const closeBrowser = async () => {
    if (browser) {
        await browser.close();
        console.log("Browser instance closed.");
    }
};

process.on("SIGINT", closeBrowser);
process.on("SIGTERM", closeBrowser);
process.on("exit", closeBrowser);