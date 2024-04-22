import express from 'express';
import puppeteer from 'puppeteer-extra';
import { promises as FileSystem } from 'fs';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const app = express();
const router = express.Router();

// Add stealth plugin and use defaults (all evasion techniques)
puppeteer.use(StealthPlugin());

interface Listing {
    title?: string;
    price?: string;
    image?: string;
    details?: {
        beds?: string;
        bath?: string;
        sqft?: string;
        lotsize?: string;
        child?:{
            link?: string
        }
    };
}

let listings: Listing[] = [];
let pageIndex = 1;

router.get("/search", async (req, res) => {
    const search = req.query.search as string;

    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });

    const page = await browser.newPage();
    const page2 = await browser.newPage();

    await page.bringToFront();

    await googleStep(page);
    await homepage(page, search);
    await getListings(page,page2, pageIndex);

    await browser.close();

    res.send('Done');
});

async function googleStep(page: any) {
    try {
        await page.goto('https://google.com/');
        await page.type('textarea[aria-label="Search"]', "top home listing websites");
        await page.keyboard.press('Enter');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        try {
        await page.waitForXPath("/html/body/div[4]/div/div[7]/div/div[2]/span/div/div[2]/div[3]/g-raised-button");
        const [button] = await page.$x("/html/body/div[4]/div/div[7]/div/div[2]/span/div/div[2]/div[3]/g-raised-button");
        if (button) {
            await button.click();
        }
        } catch (error) {
            console.log("modal is not there");
        }
        await autoScroll(page);
        await page.waitForSelector('a[href="https://www.realtor.com/"]');
        await page.click('a[href="https://www.realtor.com/"]');
    } catch (e) {
        await googleStep(page);
    }
}

async function homepage(page: any, search: string) {
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#search-bar');
    await page.type("#search-bar", search, { delay: 200 });
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
}

async function getListings(page: any, page2:any, pageIndex: number) {
    try {
        await page.waitForSelector('section[data-testid="property-list"]');
        await autoScrollFast(page, 100);
        await page.waitForSelector('div[aria-label="pagination"]', { timeout: 5000 });

        var links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('section[data-testid="property-list"] > div'), elem => {
                var baseUrl = "https://realtor.com"
                const obj: Listing = {
                    title: elem.querySelector('div[data-testid="card-address"]')?.textContent || undefined,
                    price: elem.querySelector('div[data-testid="card-price"]')?.textContent || undefined,
                    image: elem.querySelector('img[data-testid="picture-img"]')?.getAttribute("data-src") || undefined,
                    details: {
                        beds: elem.querySelector('li[data-testid="property-meta-beds"] > span[data-testid="meta-value"]')?.textContent || undefined,
                        bath: elem.querySelector('li[data-testid="property-meta-baths"] > span[data-testid="meta-value"]')?.textContent || undefined,
                        sqft: elem.querySelector('li[data-testid="property-meta-sqft"] > span > span[data-testid="meta-value"]')?.textContent || undefined,
                        lotsize: elem.querySelector('li[data-testid="property-meta-lot-size"] > span > span[data-testid="meta-value"]')?.textContent || undefined,
                        child:{
                           link: baseUrl+elem.querySelector('div[data-testid="card-content"] > a')?.getAttribute("href") || undefined,
                        }
                    }
                };
                return obj;
            });
        });
        links = links.filter((obj:Object) => Object.keys(obj).includes("title"));
        listings = [...listings, ...links];
        const exist = await page.$(`a[aria-label="Go to page ${pageIndex + 1}"]`);
        if (exist) {
            await page.click(`a[aria-label="Go to page ${pageIndex + 1}"]`);
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            await getListings(page,page2, pageIndex + 1);
        } else {
            console.log("done");
            console.log(listings);
            await FileSystem.writeFile('file.json', JSON.stringify({listings: listings}));
            await page2.bringToFront();
            await page2.goto(listings[0].details?.child?.link);
            await autoScrollFast(page2,10);
            let element = await page2.$('button[data-testid="est-payment"]')
            let value = await page2.evaluate((el:any) => el.textContent, element);
            console.log(value);
        }
    } catch (e) {
        console.log(e);
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await getListings(page,page2, pageIndex);
    }
}

async function autoScroll(page: any) {
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 250;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight - 90;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function autoScrollFast(page: any, maxScrolls: number) {
    await page.evaluate(async (maxScrolls: number) => {
        await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            let scrolls = 0;  // scrolls counter
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++;  // increment counter

                // stop scrolling if reached the end or the maximum number of scrolls
                if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, maxScrolls);  // pass maxScrolls to the function
}

export default router;