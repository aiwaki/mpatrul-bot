import { getBrowserInstance } from './browser';
import { extendPage, getPageInfo, type ExtendedPage } from './page';
import { insertClassificationsBatch, insertPagesBatch, type Classification, type Page } from '../database/pages';

async function extractLinks(page: ExtendedPage): Promise<string[]> {
    console.log("Extracting links from the page...");
    return await page.evaluate(() => {
        const elements = document.querySelectorAll("#rso .tF2Cxc");
        return Array.from(elements)
            .map(element => {
                const linkElement = element.querySelector("a");
                return linkElement ? linkElement.href : null;
            })
            .filter(Boolean) as string[];
    });
}

async function navigateToNextPage(page: ExtendedPage): Promise<boolean> {
    const hasNextPage = await page.evaluate(() => !!document.querySelector("#pnnext"));
    if (hasNextPage) {
        console.log("Navigating to the next page...");
        await Promise.all([
            page.click("#pnnext"),
            page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);
    }
    return hasNextPage;
}

async function collectLinks(query: string, page: ExtendedPage): Promise<string[]> {
    console.log("Starting link collection with query:", query);
    await page.goto(`https://www.google.ru/search?q=${query}`, { waitUntil: "networkidle2" });
    await page.waitForSelector("#rso a");

    let hasNextPage = true;
    let allLinks: string[] = [];

    while (hasNextPage) {
        const links = await extractLinks(page);
        console.log(`Collected ${links.length} links from current page.`);
        allLinks = allLinks.concat(links);
        hasNextPage = await navigateToNextPage(page);
    }

    console.log(`Total links collected: ${allLinks.length}`);
    return allLinks;
}

async function processLinks(links: string[]): Promise<[Page[], Classification[]]> {
    console.log("Processing links...");
    let pages: Page[] = [];
    let classifications: Classification[] = [];

    for (const link of links) {
        const pageInfo = await getPageInfo(link);
        if (pageInfo) {
            classifications.push({
                label: pageInfo.classifyOut.label,
                content: pageInfo.classifyOut.content,
                score: pageInfo.classifyOut.score
            });
            pages.push({
                title: pageInfo.title,
                description: pageInfo.description,
                url: link,
            });
            console.log(`Processed link: ${link}`);
        } else {
            console.log(`Failed to process link: ${link}`);
        }
    }
    return [pages, classifications];
}

async function insertData(pages: Page[], classifications: Classification[]) {
    console.log("Inserting classifications...");
    const classificationIds = await insertClassificationsBatch(classifications);

    const updatedPages = pages.map((page, index) => ({
        ...page,
        classify_out_id: classificationIds[index] || null
    }));

    console.log("Inserting pages...");
    await insertPagesBatch(updatedPages);
}

export async function searchForPages(query: string) {
    const browser = await getBrowserInstance();
    const page = extendPage(await browser.newPage());

    try {
        console.log("Starting search for pages...");
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