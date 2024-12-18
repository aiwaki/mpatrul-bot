import { getBrowserInstance } from './browser';

export const screenshotPage = async (
    url: string
): Promise<File> => {
    const browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        Referer: "https://ya.ru/",
    });

    try {
        await page.goto(url, { waitUntil: "networkidle2" });

        const screenshotData = await page.screenshot();
        return new File([new Uint8Array(screenshotData)], "screenshot.png", { type: "image/png" });
    } finally {
        await page.close();
    }
}