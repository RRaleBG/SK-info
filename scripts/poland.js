// =========================
// POLAND BANS SCRAPER
// =========================

import fetch from "node-fetch";
import { load } from "cheerio";

// Helper za formatiranje stavki
function formatItem(text) {
    const clean = text.trim();
    let type = "text";

    if (/\d{1,2}:\d{2}/.test(clean)) type = "time";
    if (/January|May|August|November|December|Easter|Christmas|Sunday|Friday|Saturday/i.test(clean)) type = "holiday";

    return { text: clean, type };
}

// Generic extractor
function extractSection(elements, matchFn, sectionName) {
    const items = [];
    elements.each((_, el) => {
        const text = elements.constructor(el).text().trim(); // ovo je pogrešno u staroj verziji
    });
}

// Ispravno: koristi se cheerio instanca $
function extractSectionFixed($, elements, matchFn, sectionName) {
    const items = [];
    elements.each((_, el) => {
        const text = $(el).text().trim();
        if (!text) return;
        if (matchFn(text)) items.push(formatItem(text));
    });
    return items.length
        ? { section: sectionName, country: "Poljska", code: "PL", items }
        : null;
}

export async function getPolandBans() {
    const url = "https://truckban.eu/Poland";
    try {
        const res = await fetch(url, { headers: { "User-Agent": "node-fetch/1.0" } });
        const html = await res.text();
        const $ = load(html);

        const bans = [];

        // Nacionalne zabrane
        const national = extractSectionFixed(
            $,
            $("#detail").nextAll("p, ul"),
            text =>
                /\d{1,2}:\d{2}/.test(text) ||
                /(holiday|Friday|Saturday|Sunday|January|May|August|November|December)/i.test(text),
            "Nacionalne zabrane"
        );
        if (national) bans.push(national);

        // Lokalne zabrane
        const local = extractSectionFixed(
            $,
            $("p"),
            text =>
                /Pozna[nń]/i.test(text) ||
                /Wroc[łl]aw/i.test(text) ||
                /Torun/i.test(text) ||
                /Gliwice/i.test(text),
            "Lokalne zabrane"
        );
        if (local) bans.push(local);

        // Dozvole
        const permits = extractSectionFixed(
            $,
            $("p"),
            text => /permit/i.test(text) || /issued/i.test(text) || /application/i.test(text),
            "Dozvole"
        );
        if (permits) bans.push(permits);

        return bans;
    } catch (e) {
        console.error("getPolandBans error:", e.message);
        return [];
    }
}
