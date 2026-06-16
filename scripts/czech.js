import fetch from "node-fetch";
import { load } from "cheerio";

function formatItem(text) {
    const clean = text.trim();
    let type = "text";
    if (/\d{1,2}:\d{2}/.test(clean)) type = "time";
    if (/holiday|public holiday|Sunday|Saturday|January|May|August|December/i.test(clean)) type = "holiday";
    return { text: clean, type };
}

function extractSection($, elements, matchFn, sectionName) {
    const items = [];
    elements.each((_, el) => {
        const text = $(el).text().trim();
        if (text && matchFn(text)) items.push(formatItem(text));
    });
    return items.length ? { section: sectionName, country: "Češka", code: "CZ", items } : null;
}

export async function getCzechBans() {
    const url = "https://truckban.eu/Czech";
    try {
        const res = await fetch(url, { headers: { "User-Agent": "node-fetch/1.0" } });
        const html = await res.text();
        const $ = load(html);

        const bans = [];

        // Nacionalne zabrane
        const national = extractSection(
            $,
            $("p, ul, li, table, tr"),
            t => /\d{1,2}:\d{2}/.test(t) || /holiday|public holiday/i.test(t),
            "Nacionalne zabrane"
        );
        if (national) bans.push(national);

        // Lokalne zabrane
        const local = extractSection(
            $,
            $("p, ul, li"),
            t => /Prague|Brno|Ostrava/i.test(t),
            "Lokalne zabrane"
        );
        if (local) bans.push(local);

        // Dozvole
        const permits = extractSection(
            $,
            $("p, ul, li"),
            t => /permit|application|issued/i.test(t),
            "Dozvole"
        );
        if (permits) bans.push(permits);

        return bans;
    } catch (e) {
        console.error("getCzechBans error:", e.message);
        return [];
    }
}
