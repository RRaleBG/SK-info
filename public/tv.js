let lastUpdatedTime = null;

// 1. Glavna funkcija za povlačenje podataka
async function loadWeather(lat, lon, mesto) {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;

    try {
        console.log("Pokušavam da učitam podatke sa:", url);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'moj-vremenski-vidzet-v1' }
        });

        if (!res.ok)
            throw new Error(`API greška: ${res.status}`);


        const data = await res.json();
        lastUpdatedTime = new Date();

        const current = data.properties.timeseries[0].data.instant.details;
        const precip = data.properties.timeseries[0].data.next_1_hours?.details?.precipitation_amount || 0;
        const hour = new Date().getHours();

        const temp = current.air_temperature;
        const wind = current.wind_speed;
        const hum = current.relative_humidity;
        const feel = temp;

        renderWeather(mesto, temp, hum, wind, feel, precip, hour);

    } catch (e) {
        console.error("Greška:", e);
    }
}

// Funkcija koja računa koliko je prošlo vremena
function getUpdateTimeText() {
    if (!lastUpdatedTime)
        return "Učitavam...";

    const diff = Math.floor((new Date() - lastUpdatedTime) / 60000);
    return diff < 1 ? "Upravo ažurirano" : `Ažurirano pre ${diff} min`;
}

function getFeelColor(temp) {
    if (temp < 10) return "#4fc3f7";       // Hladno - Plava
    if (temp >= 10 && temp <= 25)
        return "#ffce54";                  // Prijatno - Žuta/Narandžasta
    return "#ff7675";                      // Vruće - Crvena
}

// 2. Funkcija za iscrtavanje HTML-a
function renderWeather(mesto, temp, hum, wind, feel, precip, hour) {
    let iconClass = "";
    let iconSymbol = "";

    // Tvoja logika
    if (precip > 0.5) { iconClass = "rain"; iconSymbol = "🌧️"; }
    else if (temp < 0) { iconClass = "snow"; iconSymbol = "❄️"; }
    else if (hour >= 20 || hour < 6) { iconClass = "night"; iconSymbol = "🌙"; }
    else if (temp > 30) { iconClass = "hot"; iconSymbol = "🔥"; }
    else if (temp > 20) { iconClass = "sun"; iconSymbol = "☀️"; }
    else if (temp > 10) { iconClass = "cloud"; iconSymbol = "☁️"; }
    else { iconClass = "cold"; iconSymbol = "🌫️"; }

    const feelColor = feel < 10 ? "#4fc3f7" : (feel > 25 ? "#ff7675" : "#ffce54");

    document.getElementById("weathers").innerHTML = `
        <div class="weather-cards" onclick="getIpLocation()" style="cursor: pointer;">
            <div class="header">
                <span>⚓ ${mesto}</span>
                <span class="badge" style="margin-left: 8px; margin-right: 8px;">°C</span>
            </div>
            <div class="temp-section">
                <div class="weather-icon-anim ${iconClass}">${iconSymbol}</div>
                <div class="temp-info-center">
                    <div class="temp-value">${Math.round(temp)}&deg;<sup>C</sup></div>
                    <div class="condition">${iconClass.charAt(0).toUpperCase() + iconClass.slice(1)}</div>
                </div>
            </div>                   
             
            <div class="bottom-info">

                <div class="info-item">
                    <span class="info-label"> Vlažnost</span>
                    <span class="info-value" style="color: #4fc3f7;">
                        <span class="humidity-wave">💧</span> ${hum}%
                    </span>
                </div>

                <div class="info-item">
                    <span class="info-label"> Osećaj</span>
                    <span class="info-value" style="color: ${feelColor};">
                        <span class="${feel > 25 || feel < 10 ? 'feel-pulse' : ''}">🌡️</span> ${feel}&deg;
                    </span>
                </div>

                <div class="info-item">
                    <span class="info-label">Vetar</span>
                    <span class="info-value" style="color: #ffce54;">
                        <span class="wind-spinner">
                            <!-- SVG ikona vetrenjače -->
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12,2L9.2,9.2L2,12l7.2,2.8L12,22l2.8-7.2L22,12l-7.2-2.8L12,2z"/>
                            </svg>
                        </span>
                        ${(wind * 3.6).toFixed(1)} km/h
                    </span>
                </div>      

            </div>
            <div class="footer-update">                    
                <small>${getUpdateTimeText()}</small>
            </div>
        </div>
    `;
}


async function getIpLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({ lat: position.coords.latitude, lon: position.coords.longitude, city: "Vaša lokacija" });
                },
                (error) => {
                    console.warn("Geolocation denied, falling back to Belgrade:", error);
                    resolve({ lat: 44.8176, lon: 20.4569, city: "Beograd" });
                }
            );
        } else {
            resolve({ lat: 44.8176, lon: 20.4569, city: "Beograd" });
        }
    });
}

async function getCityName(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        return data.address.city || data.address.town || data.address.village || "Nepoznata lokacija";
    } catch (e) {
        return "Beograd";
    }
}

// 2. Glavna funkcija za inicijalizaciju
async function init() {
    console.log("Inicijalizacija...");

    let lat = 44.8176; // Default Beograd
    let lon = 20.4569;
    let mesto = "Beograd";

    try {
        // 1. Pokušaj dohvatanje lokacije
        const location = await getIpLocation();
        lat = location.lat;
        lon = location.lon;

        // 2. Pokušaj dohvatanje imena grada
        mesto = await getCityName(lat, lon);
        console.log("Lokacija uspešno detektovana:", mesto);
    } catch (e) {
        console.warn("Nije moglo da se detektuje mesto, koristim Beograd:", e);
    }

    loadWeather(lat, lon, mesto);
}

//window.onload = init;

window.addEventListener('load', init);