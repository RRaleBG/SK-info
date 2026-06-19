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

    //   const PROXY_SERVER = "http://localhost:4000/proxy?url=";

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
            // hls.loadSource(PROXY_SERVER + encodeURIComponent(url));
            hls.loadSource(url);
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

    const groupedByCountry = {};
    data.week.forEach(day => {
        day.entries.forEach(entry => {
            if (!groupedByCountry[entry.country])
                groupedByCountry[entry.country] = [];
            groupedByCountry[entry.country].push({ day: day.day, date: day.date, entry });
        });
    });
    const flagMap = {
        "Austrija": "./flags/at.png",
        "Slovenija": "./flags/si.png",
        "Mađarska": "./flags/hu.png",
        "Nemačka": "./flags/de.png",
        "Poljska": "./flags/pl.png",
        "Slovačka": "./flags/sk.png"
    };
    Object.entries(groupedByCountry).forEach(([country, items]) => {
        const details = document.createElement("details");
        details.className = "country-block";

        const summary = document.createElement("summary");

        const span = document.createElement("span");
        span.textContent = country;

        const flag = document.createElement("img");
        flag.src = flagMap[country] || "";
        flag.alt = country;
        flag.className = "flag-icon";

        summary.appendChild(span);
        summary.appendChild(flag);
        details.appendChild(summary);

        container.appendChild(details);

        // Klik na summary otvara modal
        summary.addEventListener("click", (e) => {
            e.preventDefault(); // spreči default expand
            const modal = document.getElementById("banModal");
            const body = document.getElementById("modal-body");
            body.innerHTML = "";

            // Naslov
            const header = document.createElement("h3");
            header.textContent = country;
            body.appendChild(header);

            // Ubaci sve detalje u modal
            items.forEach(({ day, date, entry }) => {
                const sectionBlock = document.createElement("div");
                sectionBlock.className = "section-block";

                const title = document.createElement("h4");
                title.textContent = `${day} ${date} – ${entry.section}`;
                sectionBlock.appendChild(title);

                const ul = document.createElement("ul");
                entry.items.forEach(item => ul.appendChild(formatBanItem(item)));
                sectionBlock.appendChild(ul);

                body.appendChild(sectionBlock);
            });

            modal.style.display = "block";
        });

      //  container.appendChild(details);
    });

    // Zatvaranje modala
    const modal = document.getElementById("banModal");
    const closeBtn = modal.querySelector(".close");
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };
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
