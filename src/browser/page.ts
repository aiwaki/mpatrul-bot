import { Page as PuppeteerPage } from 'puppeteer';
import { classifyText, type ClassificationOutput } from '../utils/classification';
import { getBrowserInstance } from './browser';

export interface ExtendedPage extends PuppeteerPage {
    screenshotFile(): Promise<File>;
    pageInfo(): Promise<PageInfo>;
}

export interface PageInfo {
    title: string;
    description: string;
    url: string;
    classifyOut: ClassificationOutput;
}

export const extendPage = (page: PuppeteerPage): ExtendedPage => {
    (page as ExtendedPage).screenshotFile = async function (): Promise<File> {
        const screenshotData = await this.screenshot();
        return new File([new Uint8Array(screenshotData)], "screenshot.png", { type: "image/png" });
    };

    (page as ExtendedPage).pageInfo = async function (): Promise<PageInfo> {
        const url = this.url();
        const title = await this.title();
        const description = await this.$eval(
            "meta[name='description']",
            (el) => el.getAttribute("content")
        ).catch(() => null) || "Описание не найдено.";
        const classifyOut = await getBestClassification(title, description);

        return {
            url,
            title,
            description,
            classifyOut
        };
    };

    return page as ExtendedPage;
};

const getBestClassification = async (title: string, description: string) => {
    const titleResult = await classifyText(title);
    if (titleResult.score >= 0.4) {
        return titleResult;
    }

    const descriptionResult = await classifyText(description);
    return descriptionResult.score > titleResult.score ? descriptionResult : titleResult;
};

export async function getPageScreenshot(url: string): Promise<File | undefined> {
    const browser = await getBrowserInstance();
    const page = extendPage(await browser.newPage());
    await page.setExtraHTTPHeaders({ Referer: "https://ya.ru/" });

    try {
        console.log(`Screenshoting page for URL: ${url}`);
        await page.goto(url, { waitUntil: "networkidle2" });
        return await page.screenshotFile();
    } catch (error) {
        console.error("Error screenshoting page:", error);
        return undefined;
    } finally {
        await page.close();
    }
}

export async function getPageInfo(url: string): Promise<PageInfo | undefined> {
    const browser = await getBrowserInstance();
    const page = extendPage(await browser.newPage());
    await page.setExtraHTTPHeaders({ Referer: "https://ya.ru/" });

    try {
        console.log(`Fetching page info for URL: ${url}`);
        await page.goto(url, { waitUntil: "networkidle2" });
        return await page.pageInfo();
    } catch (error) {
        console.error("Error processing page:", error);
        return undefined;
    } finally {
        await page.close();
    }
}