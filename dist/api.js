"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const fs_1 = require("fs");
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
// Add stealth plugin and use defaults (all evasion techniques)
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
let listings = [];
let pageIndex = 1;
router.get("/search", async (req, res) => {
    const search = req.query.search;
    // Launch the browser and open a new blank page
    const browser = await puppeteer_extra_1.default.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
    const page = await browser.newPage();
    const page2 = await browser.newPage();
    await page.bringToFront();
    await googleStep(page);
    await homepage(page, search);
    await getListings(page, page2, pageIndex);
    await browser.close();
    res.send('Done');
});
async function googleStep(page) {
    try {
        await page.goto('https://google.com/');
        await page.type('textarea[aria-label="Search"]', "top home listing websites");
        await page.keyboard.press('Enter');
        await page.waitForXPath("/html/body/div[4]/div/div[7]/div/div[2]/span/div/div[2]/div[3]/g-raised-button");
        const [button] = await page.$x("/html/body/div[4]/div/div[7]/div/div[2]/span/div/div[2]/div[3]/g-raised-button");
        if (button) {
            await button.click();
        }
        await autoScroll(page);
        await page.waitForSelector('a[href="https://www.realtor.com/"]');
        await page.click('a[href="https://www.realtor.com/"]');
    }
    catch (e) {
        await googleStep(page);
    }
}
async function homepage(page, search) {
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#search-bar');
    await page.type("#search-bar", search, { delay: 200 });
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
}
async function getListings(page, page2, pageIndex) {
    try {
        await page.waitForSelector('section[data-testid="property-list"]');
        await autoScrollFast(page, 100);
        await page.waitForSelector('div[aria-label="pagination"]', { timeout: 5000 });
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('section[data-testid="property-list"] > div'), elem => {
                const obj = {
                    title: elem.querySelector('div[data-testid="card-address"]')?.textContent || undefined,
                    price: elem.querySelector('div[data-testid="card-price"]')?.textContent || undefined,
                    image: elem.querySelector('img[data-testid="picture-img"]')?.getAttribute("data-src") || undefined,
                    link: elem.querySelector('div[data-testid="card-content"] > a')?.getAttribute("href") || undefined,
                    specs: {
                        beds: elem.querySelector('li[data-testid="property-meta-beds"] > span[data-testid="meta-value"]')?.textContent || undefined,
                        bath: elem.querySelector('li[data-testid="property-meta-baths"] > span[data-testid="meta-value"]')?.textContent || undefined,
                        sqft: elem.querySelector('li[data-testid="property-meta-sqft"]')?.textContent || undefined,
                        lotsize: elem.querySelector('li[data-testid="property-meta-lot-size"]')?.textContent || undefined,
                    }
                };
                return obj;
            });
        });
        listings = [...listings, ...links];
        const exist = await page.$(`a[aria-label="Go to page ${pageIndex + 1}"]`);
        if (exist) {
            await page.click(`a[aria-label="Go to page ${pageIndex + 1}"]`);
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            await getListings(page, page2, pageIndex + 1);
        }
        else {
            console.log("done");
            console.log(listings);
            await fs_1.promises.writeFile('file.json', JSON.stringify(listings));
            await page2.bringToFront();
            await page2.goto('https://realtor.com'+listings[0].link);
        }
    }
    catch (e) {
        console.log(e);
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
        await getListings(page, page2, pageIndex);
    }
}
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
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
async function autoScrollFast(page, maxScrolls) {
    await page.evaluate(async (maxScrolls) => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            let scrolls = 0; // scrolls counter
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                scrolls++; // increment counter
                // stop scrolling if reached the end or the maximum number of scrolls
                if (totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    }, maxScrolls); // pass maxScrolls to the function
}
exports.default = router;
