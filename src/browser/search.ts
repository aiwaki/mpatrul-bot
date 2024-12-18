import { type CreateLinkRequestParams, createLink } from '../services/links';
import { getBrowserInstance } from './browser';
import * as fs from 'fs';

const search = async (
) => {
    const browser = await getBrowserInstance();
    const page = await browser.newPage();

    await page.setExtraHTTPHeaders({
        Referer: "https://ya.ru/",
    });

    try {
        await page.goto("https://google.ru", { waitUntil: "networkidle2" });
        await page.waitForSelector("textarea[name='q']");
        await page.type("textarea[name='q']", "купить автоцветущие семена конопли для лучших шишек");

        await page.keyboard.press("Enter");
        await page.waitForSelector("#rso a");

        let allResults: { title: string; url: string }[] = [];
        let hasNextPage = true;

        while (hasNextPage) {
            const results = await page.evaluate((selector) => {
                const elements = document.querySelectorAll(selector);
                return Array.from(elements)
                    .map((element) => {
                        const anchor = element as HTMLAnchorElement;
                        const titleElement = anchor.querySelector("h3");
                        return {
                            title: titleElement ? titleElement.innerText : null,
                            url: anchor.href,
                        };
                    })
                    .filter((result) => result.title && result.url)
                    .map((result) => ({
                        title: result.title as string,
                        url: result.url,
                    }));
            }, "#rso a");

            for (const result of results) {
                try {
                    const createLinkParams: CreateLinkRequestParams = { url: result.url };
                    const linkResponse = await createLink(createLinkParams, Number(process.env.TG_ID));
                    if (linkResponse.error) throw new Error(linkResponse.error);

                    if (!linkResponse.data.report) {
                        allResults.push({
                            title: result.title,
                            url: result.url,
                        });
                    }
                } catch (error) {
                    console.error(`Ошибка при обработке ссылки: ${result.url}`, error);
                }
            }

            hasNextPage = await page.evaluate(() => {
                const nextButton = document.querySelector("#pnnext");
                return !!nextButton;
            });

            if (hasNextPage) {
                await Promise.all([
                    page.click("#pnnext"),
                    page.waitForNavigation({ waitUntil: "networkidle2" }),
                ]);
            }
        }

        allResults.forEach((result) =>
            console.log(`Title: ${result.title}\nURL: ${result.url}\n`)
        );

        const resultsText = allResults
            .map((result) => `Title: ${result.title}\nURL: ${result.url}\n`)
            .join("\n");
        fs.writeFileSync("out.txt", resultsText, "utf8");
    } finally {
        await page.close();
    }
}

search()