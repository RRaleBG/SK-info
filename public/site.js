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

// const PROXY_SERVER = "http://localhost:4000/proxy?url=";

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
