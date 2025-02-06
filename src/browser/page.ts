import { Page as PuppeteerPage } from "rebrowser-puppeteer-core";
import {
  classifyText,
  type ClassificationOutput,
} from "../utils/classification";
import { getBrowserInstance } from "./browser";

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
    return new File([new Uint8Array(screenshotData)], "screenshot.png", {
      type: "image/png",
    });
  };

  (page as ExtendedPage).pageInfo = async function (): Promise<PageInfo> {
    const url = this.url();
    const title = await this.title();
    let description =
      (await this.$eval("meta[name='description']", (el) =>
        el.getAttribute("content")
      ).catch(() => null)) || null;

    const classifyOut = await getBestClassification(title, description);
    if (description === null) {
      description = classifyOut.label;
    }

    return {
      url,
      title,
      description,
      classifyOut,
    };
  };

  return page as ExtendedPage;
};

const getBestClassification = async (
  title: string,
  description: string | null
) => {
  const titleResult = await classifyText(title);
  if (titleResult.score >= 0.4 || !description) {
    return titleResult;
  }

  const descriptionResult = await classifyText(description);
  return descriptionResult.score > titleResult.score
    ? descriptionResult
    : titleResult;
};

export async function getPageScreenshot(
  url: string
): Promise<File | undefined> {
  const browser = await getBrowserInstance();
  const page = extendPage(await browser.newPage());

  try {
    console.log(`Screenshoting page for URL: ${url}`);
    await page.goto(url, {
      referer: "https://ya.ru/",
      waitUntil: "domcontentloaded",
      timeout: 0,
    });
    return await page.screenshotFile();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error screenshoting page:", error.message);
    }
    return undefined;
  } finally {
    await page.close();
  }
}

export async function getPageInfo(url: string): Promise<PageInfo | undefined> {
  const browser = await getBrowserInstance();
  const page = extendPage(await browser.newPage());

  try {
    console.log(`Fetching page info for URL: ${url}`);
    await page.goto(url, {
      referer: "https://ya.ru/",
      waitUntil: "domcontentloaded",
      timeout: 0,
    });
    return await page.pageInfo();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error processing page:", error.message);
    }
    return undefined;
  } finally {
    await page.close();
  }
}
