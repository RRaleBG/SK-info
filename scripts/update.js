// scripts/update.js
import fs from "fs";
import { getAustriaBans } from "./austria.js";
import { getCroatiaBans } from "./croatia.js";
import { getSloveniaBans } from "./slovenia.js";
import { getHungaryBans } from "./hungary.js";
import { getGermanyBans } from "./germany.js";
import { getPolandBans } from "./poland.js";
import { getCzechBans } from "./czech.js";
import { getSlovakiaBans } from "./slovakia.js";
import { getLatviaBans } from "./latvia.js";
import { getItalyBans } from "./italy.js";
import { getFranceBans } from "./france.js";
import { getSpainBans } from "./spain.js";
import { getPortugalBans } from "./portugal.js";
import { getNetherlandsBans } from "./netherlands.js";
import { getBelgiumBans } from "./belgium.js";
import { getEstoniaBans } from "./estonia.js";
import { getLithuaniaBans } from "./lithuania.js";


async function safeRun(fn, name) {
    try {
        const res = await fn();
        console.log(`${name}: OK — ${Array.isArray(res) ? res.length : 'non-array result'}`);
        if (Array.isArray(res) && res.length > 0) {
            console.log(`${name} sample:`, res.slice(0, 3));
        }
        return Array.isArray(res) ? res : [];
    } catch (err) {
        console.error(`${name}: ERROR —`, err.message || err);
        return [];
    }
}

async function updateTruckBan() {
    const austria = await safeRun(getAustriaBans, "Austrija");
    const croatia = await safeRun(getCroatiaBans, "Hrvatska");
    const slovenia = await safeRun(getSloveniaBans, "Slovenija");
    const hungary = await safeRun(getHungaryBans, "Mađarska");
    const germany = await safeRun(getGermanyBans, "Nemačka");
    const poland = await safeRun(getPolandBans, "Poljska");
    const czech = await safeRun(getCzechBans, "Češka");
    const slovakia = await safeRun(getSlovakiaBans, "Slovačka");
    const latvia = await safeRun(getLatviaBans, "Letonija");
    const italy = await safeRun(getItalyBans, "Italija");
    const france = await safeRun(getFranceBans, "Francuska");
    const espana = await safeRun(getSpainBans, "Španija");
    const portugal = await safeRun(getPortugalBans, "Portugalija");
    const netherlands = await safeRun(getNetherlandsBans, "Holandija");
    const belgium = await safeRun(getBelgiumBans, "Belgija");
    const estonia = await safeRun(getEstoniaBans, "Estonija");
    const lithuania = await safeRun(getLithuaniaBans, "Litvanija");

    // Debug fajl – da vidiš sve rezultate po državama
    const all = { austria, croatia, slovenia, hungary, germany, poland, czech, slovakia, latvia, italy, france, espana, portugal, netherlands, belgium, estonia, lithuania };
    fs.writeFileSync("./public/data/eu-truckban-debug.json", JSON.stringify(all, null, 2));
    console.log("Wrote debug file public/data/eu-truckban-debug.json");

    // Spoji sve u jedan niz
    const bans = [
        ...austria,
        ...croatia,
        ...slovenia,
        ...hungary,
        ...germany,
        ...poland,
        ...czech,
        ...slovakia,
        ...latvia,
        ...italy,
        ...espana,
        ...portugal,
        ...netherlands,
        ...belgium,
        ...estonia,
        ...lithuania
    ];

    // Danasnji datum
    const today = new Date().toISOString().split("T")[0];
    const weekData = [
        {
            day: "Ponedeljak",
            date: today,
            entries: bans
        }
    ];

    fs.mkdirSync("./public/data", { recursive: true });
    fs.writeFileSync("./public/data/eu-truckban.json", JSON.stringify({ week: weekData }, null, 2));
    console.log("TruckBan data updated! -> public/data/eu-truckban.json");
}

updateTruckBan();
