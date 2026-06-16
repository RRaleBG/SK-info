import puppeteer from "puppeteer";
import { load } from "cheerio";

export async function getCroatiaBans() {
    const url = "https://www.hak.hr/info/ogranicenja";
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
        const html = await page.content();
        const $ = load(html);
        const bans = [];

        $("table tr").each((i, el) => {
            const cols = $(el).find("td");
            if (cols.length >= 2) {
                const time = $(cols.eq(1)).text().trim();
                if (time && !time.includes("Nema podataka")) {
                    bans.push({ country: "Hrvatska", code: "HR", time });
                }
            }
        });

        return bans;
    } catch (e) {
        console.error("getCroatiaBans error:", e.message);
        return [];
    } finally {
        await browser.close();
    }
}
