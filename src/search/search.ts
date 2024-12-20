import { insertLink } from '../database/api';
import { type CreateLinkRequestParams, createLink } from '../services/links';
import { type CreateMediaRequestParams, Media, createMedia } from '../services/media';
import { type CreateReportRequestParams, createReport } from '../services/reports';
import { ReportType } from '../utils/constants';
import { uploadFile } from '../utils/uploadFile';
import { getBrowserInstance } from '../browser/browser';
import * as fs from 'fs';
import { screenshotPage } from '../browser/pages';
import { classifyText } from './classification';

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

        let allResults: { title: string; url: string, label: string }[] = [];
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
                    const tgId = Number(process.env.TG_ID);

                    const createLinkParams: CreateLinkRequestParams = { url: result.url };
                    const linkResponse = await createLink(createLinkParams, tgId);
                    if (linkResponse.error) throw new Error(linkResponse.error);

                    if (!linkResponse.data.report) {
                        const out = await classifyText(result.title);
                        if (!out.content) {
                            continue;
                        }
                        allResults.push({
                            title: result.title,
                            url: result.url,
                            label: out.label
                        });

                        // TODO: Проверка по описанию, если оценка >0.3

                        /*      const alreadyExists = await insertLink(tgId, result.url);
                             if (alreadyExists) {
                                 return;
                             } */
                        /* 
                                                const screenshot = await screenshotPage(result.url)
                        
                                                const mediaParams: CreateMediaRequestParams = {
                                                    format: Media.PNG
                                                }
                                                const mediaResponse = await createMedia(mediaParams, tgId)
                                                if (mediaResponse.error) throw new Error(mediaResponse.error);
                        
                                                await uploadFile(mediaResponse.data.upload, screenshot)
                        
                                                const createRequestParams: CreateReportRequestParams = {
                                                    url: result.url,
                                                    content: ReportType.Propaganda.toString(),
                                                    isPersonal: true,
                                                    isMedia: false,
                                                    desciption: "Продажа семян.",
                                                    photoId: mediaResponse.data.id,
                                                }
                                                const reportResponse = await createReport(createRequestParams, tgId);
                                                if (reportResponse.error) throw new Error(reportResponse.error); */
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
            console.log(`Title: ${result.title}\nURL: ${result.url}\nLabel: ${result.label}\n`)
        );

        const resultsText = allResults
            .map((result) => `Title: ${result.title}\nURL: ${result.url}\nLabel: ${result.label}\n`)
            .join("\n");
        fs.writeFileSync("out.txt", resultsText, "utf8");
    } finally {
        await page.close();
    }
}

await search()