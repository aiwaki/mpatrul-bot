import { getBrowserInstance } from './browser';
import { extendPage, getPageInfo, type ExtendedPage } from './page';
import { insertClassificationsBatch, insertPagesBatch, isPageExist, type Classification, type Page } from '../database/pages';

async function extractLinks(page: ExtendedPage): Promise<string[]> {
    return page.evaluate(() => {
        const elements = document.querySelectorAll("#rso .tF2Cxc");
        return Array.from(elements)
            .map(element => element.querySelector("a")?.href)
            .filter(Boolean) as string[];
    });
}

async function navigateToNextPage(page: ExtendedPage): Promise<boolean> {
    const hasNextPage = await page.evaluate(() => !!document.querySelector("#pnnext"));
    if (hasNextPage) {
        await Promise.all([
            await page.click("#pnnext"),
            await page.waitForNavigation({ waitUntil: "networkidle2" }),
        ]);
    }
    return hasNextPage;
}

async function checkLinksExistence(links: string[]): Promise<string[]> {
    const results = await Promise.all(links.map(url => isPageExist(url).then(exists => (exists ? url : null))));
    return results.filter(Boolean) as string[];
}

async function collectLinks(query: string, page: ExtendedPage): Promise<string[]> {
    await page.goto("https://google.ru", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("textarea[name='q']");
    await page.type("textarea[name='q']", query);
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "domcontentloaded" })

    const collectedLinks = new Set<string>();
    let hasNextPage = true;

    while (hasNextPage) {
        const links = await extractLinks(page);
        const validLinks = await checkLinksExistence(links);
        validLinks.forEach(link => collectedLinks.add(link));
        hasNextPage = await navigateToNextPage(page);
    }

    return Array.from(collectedLinks);
}

async function processLinks(links: string[]): Promise<[Page[], Classification[]]> {
    const results = await Promise.all(
        links.map(async (link) => {
            try {
                const pageInfo = await getPageInfo(link);
                if (pageInfo) {
                    return {
                        page: {
                            title: pageInfo.title,
                            description: pageInfo.description,
                            url: link,
                        },
                        classification: {
                            label: pageInfo.classifyOut.label,
                            content: pageInfo.classifyOut.content,
                            score: pageInfo.classifyOut.score,
                        },
                    };
                }
            } catch (error) {
                console.error(`Error processing link ${link}:`, error);
            }
            return null;
        })
    );

    const pages: Page[] = [];
    const classifications: Classification[] = [];
    for (const result of results) {
        if (result) {
            pages.push(result.page);
            classifications.push(result.classification);
        }
    }

    return [pages, classifications];
}

async function insertData(pages: Page[], classifications: Classification[]) {
    const classificationIds = await insertClassificationsBatch(classifications);

    const updatedPages = pages.map((page, index) => ({
        ...page,
        classify_out_id: classificationIds[index] || null,
    }));

    await insertPagesBatch(updatedPages);
}

export async function searchForPages(query: string) {
    const browser = await getBrowserInstance();
    const page = extendPage(await browser.newPage());

    try {
        const links = await collectLinks(query, page);
        const [pages, classifications] = await processLinks(links);
        await insertData(pages, classifications);
        console.log("Search completed successfully.");
    } catch (error) {
        console.error("Error during page search:", error);
    } finally {
        await page.close();
    }
}

await searchForPages("купить автоцветущие семена конопли для лучших шишек");
