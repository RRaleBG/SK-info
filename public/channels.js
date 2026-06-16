export function renderChannels(channels) {
    const container = document.querySelector(".container");
    container.innerHTML = "";

    channels.forEach(ch => {
        const div = document.createElement("div");
        div.className = "channel";

        div.innerHTML = `
      <h2>${ch.name}</h2>
      ${ch.logo ? `<img src="${ch.logo}" alt="${ch.name}" class="logo">` : ""}
      <video poster="${ch.logo || './placeholder.png'}" controls playsinline></video>
      <div class="status">
        <span class="dot"></span>
        <span class="label">Provera...</span>
      </div>
    `;
        container.appendChild(div);

        const video = div.querySelector("video");
        const dot = div.querySelector(".dot");
        const label = div.querySelector(".label");

        attachStream(video, ch.url, dot, label);
    });
}

export function attachStream(el, url, dot, label) {
    // Definisi proxy putanju
    const PROXY_URL = "http://localhost:4000/proxy?url=";
    const proxiedUrl = PROXY_URL + encodeURIComponent(url);

    if (Hls.isSupported()) {
        const hls = new Hls({ lowLatencyMode: true, enableWorker: true });

        // Učitaj PROXY URL, a ne originalni URL
        hls.loadSource(proxiedUrl);
        hls.attachMedia(el);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            dot.style.background = "limegreen";
            label.textContent = "Online";
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            // Dodajemo detaljnije logovanje greške da vidimo da li proxy radi
            console.error("HLS Error:", data.details);
            dot.style.background = "red";
            label.textContent = "Offline";
        });
    } else if (el.canPlayType("application/vnd.apple.mpegurl")) {
        el.src = proxiedUrl; // Takođe koristi proxiedUrl
        dot.style.background = "limegreen";
        label.textContent = "Online";
    }
}
