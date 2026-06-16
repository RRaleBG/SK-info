export async function loadM3U(url) {
    const res = await fetch(url);
    const text = await res.text();

    const lines = text.split("\n");
    const channels = [];
    let current = null;

    lines.forEach(line => {
        if (line.startsWith("#EXTINF")) {
            const nameMatch = line.match(/,(.+)$/);
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const groupMatch = line.match(/group-title="([^"]+)"/);

            current = {
                name: nameMatch ? nameMatch[1].trim() : "Unknown",
                logo: logoMatch ? logoMatch[1] : "",
                group: groupMatch ? groupMatch[1] : "Undefined",
                url: ""
            };
        } else if (line.startsWith("http")) {
            if (current) {
                current.url = line.trim();

                // ✅ Samo HLS/HTTP(S) linkovi se dodaju
                if (current.url.startsWith("http") && current.url.includes(".m3u8")) {
                    channels.push(current);
                }

                current = null;
            }
        }
    });

    return channels;
}
