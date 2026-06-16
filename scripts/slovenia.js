import fetch from "node-fetch";
import { load } from "cheerio";

function formatItem(text) {
    const clean = text.trim();
    let type = "text";
    if (/\d{1,2}:\d{2}/.test(clean)) type = "time";
    if (/holiday|Sunday|Saturday|January|May|August|December/i.test(clean)) type = "holiday";
    return { text: clean, type };
}

function extractSection($, selector, matchFn, sectionName) {
    const items = [];
    $(selector).each((_, el) => {
        const text = $(el).text().trim();
        if (text && matchFn(text)) items.push(formatItem(text));
    });
    return items.length ? { section: sectionName, country: "Slovenija", code: "SI", items } : null;
}

export async function getSloveniaBans() {
    const url = "https://truckban.eu/Slovenia";
    try {
        const res = await fetch(url, { headers: { "User-Agent": "node-fetch/1.0" } });
        const html = await res.text();
        const $ = load(html);

        const bans = [];
        const national = extractSection($, "p, ul", t => /\d{1,2}:\d{2}/.test(t) || /holiday/i.test(t), "Nacionalne zabrane");
        if (national) bans.push(national);

        const local = extractSection($, "p", t => /Ljubljana|Maribor|Celje/i.test(t), "Lokalne zabrane");
        if (local) bans.push(local);

        const permits = extractSection($, "p", t => /permit|application|issued/i.test(t), "Dozvole");
        if (permits) bans.push(permits);

        return bans;
    } catch (e) {
        console.error("getSloveniaBans error:", e.message);
        return [];
    }
}
