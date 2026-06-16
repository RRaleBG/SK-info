/* =========================
   CAMERAS (HLS)
========================= */
function loadCameras() {
    const cams = {
        "cam-horgos1": "https://kamere.amss.org.rs/horgos1/horgos1.m3u8",
        "cam-horgos2": "https://kamere.amss.org.rs/horgos2/horgos2.m3u8",

        "cam-batrovci1": "https://kamere.amss.org.rs/batrovci1/batrovci1.m3u8",
        "cam-batrovci2": "https://kamere.amss.org.rs/batrovci2/batrovci2.m3u8",

        "cam-gradina1": "https://kamere.amss.org.rs/gradina1/gradina1.m3u8",
        "cam-gradina2": "https://kamere.amss.org.rs/gradina2/gradina2.m3u8",

        "cam-presevo1": "https://kamere.amss.org.rs/presevo1/presevo1.m3u8",
        "cam-presevo2": "https://kamere.amss.org.rs/presevo2/presevo2.m3u8",

        "cam-vatin1": "https://kamere.mup.gov.rs:4443/Vatin/vatin1.m3u8",
        "cam-vatin2": "https://kamere.mup.gov.rs:4443/Vatin/vatin2.m3u8",

        "cam-kelebija1": "https://kamere.mup.gov.rs:4443/Kelebija/kelebija1.m3u8",
        "cam-kelebija2": "https://kamere.mup.gov.rs:4443/Kelebija/kelebija2.m3u8",

        "djala1": "https://kamere.mup.gov.rs:4443/Djala/djala1.m3u8",
        "djala2": "https://kamere.mup.gov.rs:4443/Djala/djala2.m3u8"
    };

    const PROXY_SERVER = "http://localhost:4000/proxy?url=";

    Object.entries(cams).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (!el)
            return;

        if (window.Hls && Hls.isSupported()) {
            const hls = new Hls(
                {
                    debug: false,
                    lowLatencyMode: true,
                    enableWorker: true
                });
            hls.loadSource(PROXY_SERVER + encodeURIComponent(url));
            hls.attachMedia(el);
        }
        else if (el.canPlayType && el.canPlayType("application/vnd.apple.mpegurl")) {
            el.src = url;
        } else {
            console.warn("No HLS support for", id);
        }
    });
}

function attachStream(videoId, url) {
    const el = document.getElementById(videoId);
    if (!el) return;

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(el);
    }
    else if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = url;
    }
    else {
        el.insertAdjacentHTML("afterend", "<p style='color:red'>Nema HLS podrške</p>");
    }
}

/* =========================
   TRUCK BAN RENDER
========================= */
function formatBanItem(item) {
    const li = document.createElement("li");
    li.textContent = item.text || item;
    if (item.type === "time")
        li.className = "ban-time";
    if (item.type === "holiday")
        li.className = "holiday";
    return li;
}

function groupByDay(weekData) {
    const grouped = {};
    weekData.forEach(day => {
        const key = `${day.day} ${day.date}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(day);
    });
    return grouped;
}

async function loadTruckBan() {
    const res = await fetch("./data/eu-truckban.json");
    const data = await res.json();
    const container = document.getElementById("truckban");

    // grupisanje po zemlji
    const groupedByCountry = {};
    data.week.forEach(day => {
        day.entries.forEach(entry => {
            if (!groupedByCountry[entry.country]) groupedByCountry[entry.country] = [];
            groupedByCountry[entry.country].push({ day: day.day, date: day.date, entry });
        });
    });

    Object.entries(groupedByCountry).forEach(([country, items]) => {
        const details = document.createElement("details");
        details.className = "country-block";

        const summary = document.createElement("summary");
        summary.textContent = country;
        details.appendChild(summary);

        // grupisanje po danu unutar zemlje
        const groupedByDay = {};
        items.forEach(({ day, date, entry }) => {
            const key = `${day} ${date}`;
            if (!groupedByDay[key]) groupedByDay[key] = [];
            groupedByDay[key].push(entry);
        });

        Object.entries(groupedByDay).forEach(([dayKey, entries]) => {
            const dayCard = document.createElement("div");
            dayCard.className = "day-card";

            const header = document.createElement("div");
            header.className = "day-header";
            header.textContent = dayKey;
            dayCard.appendChild(header);

            entries.forEach(entry => {
                const sectionBlock = document.createElement("div");
                sectionBlock.className = "section-block";

                const title = document.createElement("h4");
                title.textContent = `${entry.section}`;
                sectionBlock.appendChild(title);

                const ul = document.createElement("ul");
                entry.items.slice(0, 3).forEach(item => ul.appendChild(formatBanItem(item)));

                const hidden = document.createElement("div");
                hidden.className = "hidden-items";
                hidden.style.display = "none";

                const hiddenList = document.createElement("ul");
                entry.items.slice(3).forEach(item => hiddenList.appendChild(formatBanItem(item)));
                hidden.appendChild(hiddenList);

                sectionBlock.appendChild(ul);
                sectionBlock.appendChild(hidden);

                const btn = document.createElement("button");
                btn.className = "toggle-btn";
                btn.textContent = "➕ Prikaži više";
                btn.onclick = () => {
                    hidden.style.display = hidden.style.display === "none" ? "block" : "none";
                    btn.textContent = hidden.style.display === "none" ? "➕ Prikaži više" : "➖ Prikaži manje";
                };

                sectionBlock.appendChild(btn);
                dayCard.appendChild(sectionBlock);
            });

            details.appendChild(dayCard);
        });

        container.appendChild(details);
    });
}

/* =========================
   INIT
========================= */
window.addEventListener("load", () => {
    loadTruckBan();
    loadCameras();
});

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(console.error);
    });
}
