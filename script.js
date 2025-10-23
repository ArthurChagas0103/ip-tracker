const IPIFY_URL = "https://api.ipify.org?format=json";
const IPWHO_URL = (ip) => `https://ipwho.is/${ip}`;
const ipInput = document.getElementById("ipInput");
const btnLookup = document.getElementById("btnLookup");
const btnMyIp = document.getElementById("btnMyIp");
const rawJson = document.getElementById("rawJson");
const els = {
  ip: document.getElementById("ip"),
  country: document.getElementById("country"),
  city: document.getElementById("city"),
  latlon: document.getElementById("latlon"),
  org: document.getElementById("org"),
  isp: document.getElementById("isp"),
  tz: document.getElementById("tz"),
  connection: document.getElementById("connection"),
};
let map = L.map("map", { attributionControl: false }).setView([0, 0], 2);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  detectRetina: true,
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

function showError(message) {
  rawJson.textContent = message;
  for (const k in els) els[k].textContent = "—";

  markerLayer.clearLayers();
  map.setView([0, 0], 2);
}

function updateUI(data) {
  if (!data || data.success === false) {
    showError("Nenhum dado encontrado para esse IP.");

    return;
  }

  els.ip.textContent = data.ip || "—";
  els.country.textContent =
    (data.country || "—") +
    (data.country_code ? " (" + data.country_code + ")" : "");
  els.city.textContent = data.city || "—";
  els.latlon.textContent =
    data.latitude && data.longitude
      ? `${data.latitude}, ${data.longitude}`
      : "—";
  els.org.textContent = data.org || data["connection"]?.asn || "—";
  els.isp.textContent = data.isp || data["connection"]?.isp || "—";
  els.tz.textContent = data.timezone?.id || data.timezone || "—";
  els.connection.textContent = `${data.type || "—"} ${
    data.region || ""
  }`.trim();
  rawJson.textContent = JSON.stringify(data, null, 2);

  markerLayer.clearLayers();
  if (data.latitude && data.longitude) {
    const lat = parseFloat(data.latitude);
    const lon = parseFloat(data.longitude);
    const m = L.marker([lat, lon]).addTo(markerLayer);

    m.bindPopup(
      `<b>${data.ip}</b><br>${data.city || ""}, ${data.country || ""}`
    ).openPopup();
    map.setView([lat, lon], 10);
  } else {
    map.setView([0, 0], 2);
  }
}

async function fetchMyIp() {
  try {
    const res = await fetch(IPIFY_URL, { cache: "no-cache" });

    if (!res.ok) throw new Error("Falha ao buscar IP público");

    const j = await res.json();

    return j.ip;
  } catch (e) {
    console.error(e);

    throw e;
  }
}

async function lookupIp(ip) {
  try {
    const url = IPWHO_URL(encodeURIComponent(ip));
    const res = await fetch(url, { cache: "no-cache" });

    if (!res.ok) throw new Error("Erro na API de geolocalização");

    const j = await res.json();

    return j;
  } catch (e) {
    console.error(e);

    throw e;
  }
}

async function doLookup(ipToQuery) {
  try {
    rawJson.textContent = "Carregando…";
    let ip = ipToQuery && ipToQuery.trim() ? ipToQuery.trim() : null;
    if (!ip) {
      ip = await fetchMyIp();
    }

    const v4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    const v6 = /^[0-9a-fA-F:]+$/;
    if (!v4.test(ip) && !v6.test(ip)) {
      alert("Por favor, insira um endereço IP válido.");
    }

    const geo = await lookupIp(ip);

    updateUI(geo);
  } catch (err) {
    showError("Erro: " + (err.message || err));
  }
}

btnLookup.addEventListener("click", () => doLookup(ipInput.value));
btnMyIp.addEventListener("click", async () => {
  try {
    ipInput.value = "";

    await doLookup("");
  } catch (e) {}
});

ipInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnLookup.click();
});

document.getElementById("btnCopyJson").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(rawJson.textContent);

    alert("JSON copiado para a área de transferência.");
  } catch (e) {
    alert("Não foi possível copiar: " + e);
  }
});

document.getElementById("btnDownloadJson").addEventListener("click", () => {
  const blob = new Blob([rawJson.textContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "ipinfo.json";

  a.click();
  URL.revokeObjectURL(url);
});

(async function init() {
  try {
    await doLookup("");
  } catch (e) {
    console.warn(e);
  }
})();
