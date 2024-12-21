import { getBrowserInstance } from './browser';
import { classifyText } from '../utils/classification';

export interface SiteInfo {
    title?: string;
    description?: string;
    url: string;
}

export const processSiteInfo = async (
    site: SiteInfo
) => {
    try {
        if (!site.title || !site.description) {
            return;
        }

        let classifyOut = await classifyText(site.title);
        if (classifyOut.score < 0.4) {
            const descriptionOut = await classifyText(site.description)
            if (descriptionOut.score > classifyOut.score) {
                classifyOut = descriptionOut
            }
        }
    } catch (error) {
        console.error(`Ошибка при обработке ссылки: ${site.url}`, error);
    }
};

export const searchForSites = async () => {
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

        let hasNextPage = true;
        while (hasNextPage) {
            const results = await page.evaluate((): SiteInfo[] => {
                const elements = document.querySelectorAll("#rso .tF2Cxc");
                return Array.from(elements).map((element) => {
                    const titleElement = element.querySelector("h3");
                    const linkElement = element.querySelector("a");
                    const descriptionElement = element.querySelector(".VwiC3b");
                    return {
                        title: titleElement ? titleElement.textContent?.trim() : "",
                        description: descriptionElement ? descriptionElement.textContent?.trim() : "",
                        url: linkElement ? linkElement.href : "",
                    };
                }).filter((result) => result.title && result.url);
            });

            await Promise.all(results.map((result) => processSiteInfo(result)));

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
    } finally {
        await browser.close();
    }
};

// Возвращать все результаты и сохранять их в отдельную таблицу по запросу
// Брать ссылку из таблицы и отправлять отчет по подтверждению волонтера

await searchForSites();
