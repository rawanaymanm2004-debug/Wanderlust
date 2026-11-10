// ===== Elements =====
const trigger = document.getElementById("country-trigger");
const panel = document.getElementById("country-panel");
const countryList = document.getElementById("country-list");
const countrySelect = document.getElementById("global-country");
const flagImg = document.getElementById("selected-country-flag");
const nameSpan = document.getElementById("selected-country-name");
const citySelect = document.getElementById("global-city");
const cityName = document.getElementById("selected-city-name");
const yearSelect = document.getElementById("global-year");
const exploreBtn = document.getElementById("global-search-btn");
const statHolidays = document.getElementById("stat-holidays");
const statCountries = document.getElementById("stat-countries");
const clearBtn = document.getElementById("clear-selection-btn");
const selectedBox = document.getElementById("selected-destination");
const holidaysContent = document.getElementById("holidays-content");
const triggerText = document.getElementById("trigger-text");
const searchInput = document.getElementById("country-search");
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const holidaysSelection = document.getElementById("holidays-selection");
const holidaysFlag = document.getElementById("holidays-flag");
const holidaysCountry = document.getElementById("holidays-country");
const holidaysYear = document.getElementById("holidays-year");
const holidaysSubtitle = document.getElementById("holidays-subtitle");
const statSaved = document.getElementById("stat-saved");
const plansBadge = document.getElementById("plans-count");
const plansContent = document.getElementById("plans-content");
const planFilters = document.querySelectorAll(".plan-filter");
const clearAllBtn = document.getElementById("clear-all-plans-btn");
const lwContent = document.getElementById("lw-content");
const lwSelection = document.getElementById("lw-selection");
const lwFlag = document.getElementById("lw-flag");
const lwCountry = document.getElementById("lw-country");
const lwYear = document.getElementById("lw-year");
const weatherContent = document.getElementById("weather-content");
const weatherSelection = document.getElementById("weather-selection");
const sunContent = document.getElementById("sun-times-content");
const sunSelection = document.querySelector(
  "#sun-times-view .view-header-selection",
);
const currencyAmount = document.getElementById("currency-amount");
const currencyFrom = document.getElementById("currency-from");
const currencyTo = document.getElementById("currency-to");
const currencyResult = document.getElementById("currency-result");
const swapBtn = document.getElementById("swap-currencies-btn");
const convertBtn = document.getElementById("convert-btn");
const popularGrid = document.getElementById("popular-currencies");
const eventsContent = document.getElementById("events-content");
const eventsSelection = document.querySelector(
  "#events-view .view-header-selection",
);
const TICKETMASTER_KEY = "VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y";
const countryInfoBox = document.getElementById("dashboard-country-info");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingText = document.getElementById("loading-text");

function setLoading(isLoading, text) {
  if (text) loadingText.textContent = text;
  loadingOverlay.classList.toggle("hidden", !isLoading);
}
// ===== State =====
let allCountries = [];
let rates = null;
let ratesUpdated = "";
const state = {
  code: "",
  name: "",
  city: "",
  year: "2026",
  holidays: [],
  longWeekends: [],
  events: [],
  planFilter: "all",
  coords: null,
  weather: null,
  sunTimes: null,
};
// ===== Countries =====
function renderCountryList(list) {
  if (list.length === 0) {
    countryList.innerHTML = '<li class="cs-item">No countries found</li>';
    return;
  }
  countryList.innerHTML = list
    .map(function (country) {
      return `
        <li class="cs-item" data-code="${country.countryCode}">
          <img class="cs-flag" loading="lazy"
               src="https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png"
               alt="${country.name}">
          <span>${country.name}</span>
          <span class="cs-code">${country.countryCode}</span>
        </li>
      `;
    })
    .join("");
}

async function getCountries() {
  try {
    const response = await fetch("https://date.nager.at/api/v3/AvailableCountries");
    if (!response.ok) throw new Error(`Countries error ${response.status}`);
    const countries = await response.json();

    countrySelect.innerHTML = '<option value="">Select Country</option>';
    countries.forEach(function (country) {
      const option = document.createElement("option");
      option.value = country.countryCode;
      option.textContent = country.name;
      countrySelect.appendChild(option);
    });

    statCountries.textContent = countries.length;
    allCountries = countries;
    renderCountryList(countries);
  } catch (error) {
    console.error("Countries failed:", error);
    Swal.fire({
      icon: "error",
      title: "Couldn't load countries",
      text: "Please check your connection and refresh the page.",
    });
  }
}
getCountries();

countryInfoBox.innerHTML = `
  <div class="empty-state">
    <div class="empty-icon"><i class="fa-solid fa-globe"></i></div>
    <p>Select a country to view detailed information</p>
  </div>
`;

// ===== Holidays =====
async function getHolidays(year, code) {
  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/${code}`,
  );
  if (!response.ok) throw new Error(`Nager error ${response.status}`);
  return await response.json();
}
//=====plans (local storage)======

function getPlans() {
  return JSON.parse(localStorage.getItem("plans")) || [];
}
function savePlans(plans) {
  localStorage.setItem("plans", JSON.stringify(plans));
}
function isSaved(id) {
  return getPlans().some(function (plan) {
    return plan.id === id;
  });
}
function updatePlansCount() {
  const count = getPlans().length;
  statSaved.textContent = count;
  plansBadge.textContent = count;

  if (count === 0) {
    plansBadge.classList.add("hidden");
    plansBadge.style.display = "none";
  } else {
    plansBadge.classList.remove("hidden");
    plansBadge.style.display = "inline-flex";
  }
}
function togglePlan(plan) {
  let plans = getPlans();
  if (isSaved(plan.id)) {
    plans = plans.filter(function (p) {
      return p.id !== plan.id;
    });
  } else {
    plans.push(plan);
  }
  savePlans(plans);
  updatePlansCount();
}
function fullDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function planCard(plan) {
  const labels = {
    holiday: "HOLIDAY",
    longweekend: "LONG WEEKEND",
    event: "EVENT",
  };
  const dates =
    plan.type === "longweekend"
      ? `${fullDate(plan.date)} - ${fullDate(plan.endDate)}`
      : fullDate(plan.date);

  return `
    <div class="plan-item">
      <span class="plan-tag plan-tag-${plan.type}">${labels[plan.type]}</span>
      <h3>${plan.title}</h3>
      <p class="plan-line"><i class="fa-regular fa-calendar"></i> ${dates}</p>
      <p class="plan-line"><i class="fa-solid fa-circle-info"></i> ${plan.info || ""}</p>
      <button class="plan-remove-btn plan-delete-btn" data-id="${plan.id}">
        <i class="fa-solid fa-trash"></i> Remove
      </button>
    </div>
  `;
}
function renderPlansPage() {
  const plans = getPlans();
  document.getElementById("filter-all-count").textContent = plans.length;
  document.getElementById("filter-holiday-count").textContent = plans.filter(
    (p) => p.type === "holiday",
  ).length;
  document.getElementById("filter-event-count").textContent = plans.filter(
    (p) => p.type === "event",
  ).length;
  document.getElementById("filter-lw-count").textContent = plans.filter(
    (p) => p.type === "longweekend",
  ).length;

  const shown =
    state.planFilter === "all"
      ? plans
      : plans.filter((p) => p.type === state.planFilter);

  if (shown.length === 0) {
    plansContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
        <h3>No Saved Plans Yet</h3>
        <p>Start exploring and save holidays, events, or long weekends you like!</p>
        <button class="btn-primary" id="start-exploring-btn">
          <i class="fa-solid fa-compass"></i> Start Exploring
        </button>
      </div>
    `;
    return;
  }

  plansContent.innerHTML = shown.map(planCard).join("");
}
function displayHolidays(holidays) {
  holidaysContent.innerHTML = holidays
    .map(function (holiday, index) {
      const date = new Date(holiday.date);
      const day = date.getUTCDate();
      const month = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const weekday = date.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "UTC",
      });

      const id = `holiday-${state.code}-${holiday.date}`;
      const heart = isSaved(id) ? "fa-solid" : "fa-regular";

      return `
        <div class="holiday-card">
          <div class="holiday-card-header">
            <div class="holiday-date-box"><span class="day">${day}</span><span class="month">${month}</span></div>
            <button class="holiday-action-btn" data-index="${index}"><i class="${heart} fa-heart"></i></button>
          </div>
          <h3>${holiday.localName}</h3>
          <p class="holiday-name">${holiday.name}</p>
          <div class="holiday-card-footer">
            <span class="holiday-day-badge"><i class="fa-regular fa-calendar"></i> ${weekday}</span>
            <span class="holiday-type-badge">${holiday.types[0]}</span>
          </div>
        </div>
      `;
    })
    .join("");
}
function renderHolidaysPage() {
  if (state.code === "") {
    holidaysSelection.style.display = "none";
    holidaysContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-calendar-xmark"></i></div>
        <h3>No country selected</h3>
        <p>Choose a country from the Dashboard and press Explore.</p>
      </div>
    `;
    holidaysSubtitle.textContent =
      "Browse public holidays and plan your trips around them";
    return;
  }

  holidaysSelection.style.display = "flex";
  holidaysFlag.src = `https://flagcdn.com/w40/${state.code.toLowerCase()}.png`;
  holidaysFlag.alt = state.name;
  holidaysCountry.textContent = state.name;
  holidaysYear.textContent = state.year;
  holidaysSubtitle.textContent = `Browse public holidays for ${state.name} and plan your trips around them`;
  displayHolidays(state.holidays);
}

//========long weekend=======
async function getLongWeekends(year, code) {
  const response = await fetch(
    `https://date.nager.at/api/v3/LongWeekend/${year}/${code}`,
  );
  if (!response.ok) throw new Error(`Nager error ${response.status}`);
  return await response.json();
}
function shortDate(dateStr) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
function daysVisual(start, end) {
  const days = [];
  const current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const dow = current.getUTCDay();
    const cls = dow === 0 || dow === 6 ? "lw-day weekend" : "lw-day";
    const name = current.toLocaleString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });
    days.push(
      `<div class="${cls}"><span class="name">${name}</span><span class="num">${current.getUTCDate()}</span></div>`,
    );
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return days.join("");
}

function displayLongWeekends(list) {
  if (list.length === 0) {
    lwContent.innerHTML = `
      <div class="empty-state">
        <h3>No long weekends found</h3>
        <p>There are no long weekends for this country and year.</p>
      </div>
    `;
    return;
  }

  lwContent.innerHTML = list
    .map(function (lw, index) {
      const id = `lw-${state.code}-${lw.startDate}`;
      const heart = isSaved(id) ? "fa-solid" : "fa-regular";
      const info = lw.needBridgeDays
        ? `<div class="lw-info-box warning"><i class="fa-solid fa-info-circle"></i> Requires taking a bridge day off</div>`
        : `<div class="lw-info-box success"><i class="fa-solid fa-check-circle"></i> No extra days off needed!</div>`;

      return `
        <div class="lw-card">
          <div class="lw-card-header">
            <span class="lw-badge"><i class="fa-solid fa-calendar-days"></i> ${lw.dayCount} Days</span>
            <button class="holiday-action-btn" data-index="${index}"><i class="${heart} fa-heart"></i></button>
          </div>
          <h3>Long Weekend #${index + 1}</h3>
          <div class="lw-dates"><i class="fa-regular fa-calendar"></i> ${shortDate(lw.startDate)} - ${shortDate(lw.endDate)}, ${state.year}</div>
          ${info}
          <div class="lw-days-visual">${daysVisual(lw.startDate, lw.endDate)}</div>
        </div>
      `;
    })
    .join("");
}

function renderLongWeekendsPage() {
  if (state.code === "") {
    lwSelection.style.display = "none";
    lwContent.innerHTML = `
      <div class="empty-state">
        <h3>No country selected</h3>
        <p>Choose a country from the Dashboard and press Explore.</p>
      </div>
    `;
    return;
  }

  lwSelection.style.display = "flex";
  lwFlag.src = `https://flagcdn.com/w40/${state.code.toLowerCase()}.png`;
  lwFlag.alt = state.name;
  lwCountry.textContent = state.name;
  lwYear.textContent = state.year;
  displayLongWeekends(state.longWeekends);
}
async function searchPlace(name, countryCode) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&countryCode=${countryCode}`,
  );
  const data = await response.json();
  if (!data.results) return null;

  const place = data.results[0];
  return {
    name: place.name,
    lat: place.latitude,
    lon: place.longitude,
    timezone: place.timezone,
  };
}

async function getCoordinates(countryCode, countryName, city) {
  if (city) {
    const place = await searchPlace(city, countryCode);
    if (place) return place;

    Swal.fire({
      icon: "info",
      title: "City not found",
      text: `We couldn't find "${city}", so we're showing ${countryName} instead.`,
    });
  }
  return await searchPlace(countryName, countryCode);
}
//=======weather==========
async function getWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max,precipitation_sum,sunrise,sunset` +
    `&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather error ${response.status}`);
  return await response.json();
}

function weatherInfo(code) {
  if (code === 0) return { text: "Clear sky", icon: "fa-sun" };
  if (code === 1) return { text: "Mainly clear", icon: "fa-sun" };
  if (code === 2) return { text: "Partly cloudy", icon: "fa-cloud-sun" };
  if (code === 3) return { text: "Overcast", icon: "fa-cloud" };
  if (code === 45 || code === 48) return { text: "Fog", icon: "fa-smog" };
  if (code >= 51 && code <= 57)
    return { text: "Drizzle", icon: "fa-cloud-rain" };
  if (code >= 61 && code <= 67)
    return { text: "Rain", icon: "fa-cloud-showers-heavy" };
  if (code >= 71 && code <= 77) return { text: "Snow", icon: "fa-snowflake" };
  if (code >= 80 && code <= 82)
    return { text: "Rain showers", icon: "fa-cloud-showers-heavy" };
  if (code === 85 || code === 86)
    return { text: "Snow showers", icon: "fa-snowflake" };
  if (code >= 95) return { text: "Thunderstorm", icon: "fa-cloud-bolt" };
  return { text: "Unknown", icon: "fa-cloud" };
}

function windDirection(deg) {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(deg / 22.5) % 16];
}

function uvLevel(uv) {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}

function timeFromIso(iso) {
  const [h, m] = iso.slice(11, 16).split(":");
  const hour = Number(h);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${String(hour % 12 || 12).padStart(2, "0")}:${m} ${suffix}`;
}

function sunProgress(w) {
  const rise = new Date(w.daily.sunrise[0]).getTime();
  const set = new Date(w.daily.sunset[0]).getTime();
  const nowTime = new Date(w.current.time).getTime();
  const percent = ((nowTime - rise) / (set - rise)) * 100;
  return Math.max(0, Math.min(100, percent));
}
function hourlyHtml(w) {
  const h = w.hourly;
  const start = h.time.findIndex(function (t) {
    return t.slice(0, 13) === w.current.time.slice(0, 13);
  });
  if (start === -1) return "";

  return h.time
    .slice(start, start + 24)
    .map(function (t, i) {
      const idx = start + i;
      const hour = Number(t.slice(11, 13));
      const label =
        i === 0 ? "Now" : `${hour % 12 || 12} ${hour >= 12 ? "PM" : "AM"}`;
      const info = weatherInfo(h.weather_code[idx]);
      const rain = h.precipitation_probability[idx];

      return `
        <div class="hourly-item ${i === 0 ? "now" : ""}">
          <span class="hourly-time">${label}</span>
          <div class="hourly-icon"><i class="fa-solid ${info.icon}"></i></div>
          <span class="hourly-temp">${Math.round(h.temperature_2m[idx])}°</span>
          ${rain > 0 ? `<span class="hourly-precip"><i class="fa-solid fa-droplet"></i> ${rain}%</span>` : ""}
        </div>
      `;
    })
    .join("");
}
function displayWeather(w) {
  const c = w.current;
  const d = w.daily;
  const now = weatherInfo(c.weather_code);
  const uvName = uvLevel(d.uv_index_max[0]);

  const dateText = new Date(c.time).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const forecast = d.time
    .map(function (dateStr, i) {
      const date = new Date(dateStr);
      const label =
        i === 0
          ? "Today"
          : date.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });
      const dayMonth = date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
      const info = weatherInfo(d.weather_code[i]);
      const rain = d.precipitation_probability_max[i];

      return `
        <div class="forecast-day ${i === 0 ? "today" : ""}">
          <div class="forecast-day-name"><span class="day-label">${label}</span><span class="day-date">${dayMonth}</span></div>
          <div class="forecast-icon"><i class="fa-solid ${info.icon}"></i></div>
          <div class="forecast-temps"><span class="temp-max">${Math.round(d.temperature_2m_max[i])}°</span><span class="temp-min">${Math.round(d.temperature_2m_min[i])}°</span></div>
          <div class="forecast-precip">${rain > 0 ? `<i class="fa-solid fa-droplet"></i><span>${rain}%</span>` : ""}</div>
        </div>
      `;
    })
    .join("");

  weatherContent.innerHTML = `
    <div class="weather-hero-card weather-sunny">
      <div class="weather-hero-content">
        <div class="weather-location">
          <i class="fa-solid fa-location-dot"></i>
          <span>${state.coords.name}</span>
          <span class="weather-time">${dateText}</span>
        </div>
        <div class="weather-hero-main">
          <div class="weather-hero-left">
            <div class="weather-hero-icon"><i class="fa-solid ${now.icon}"></i></div>
            <div class="weather-hero-temp">
              <span class="temp-value">${Math.round(c.temperature_2m)}</span>
              <span class="temp-unit">°C</span>
            </div>
          </div>
          <div class="weather-hero-right">
            <div class="weather-condition">${now.text}</div>
            <div class="weather-feels">Feels like ${Math.round(c.apparent_temperature)}°C</div>
            <div class="weather-high-low">
              <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(d.temperature_2m_max[0])}°</span>
              <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(d.temperature_2m_min[0])}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="weather-details-grid">
      <div class="weather-detail-card">
        <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
        <div class="detail-info">
          <span class="detail-label">Humidity</span>
          <span class="detail-value">${c.relative_humidity_2m}%</span>
        </div>
      </div>

      <div class="weather-detail-card">
        <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
        <div class="detail-info">
          <span class="detail-label">Wind</span>
          <span class="detail-value">${Math.round(c.wind_speed_10m)} km/h</span>
        </div>
        <div class="detail-extra">${windDirection(c.wind_direction_10m)}</div>
      </div>

      <div class="weather-detail-card">
        <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
        <div class="detail-info">
          <span class="detail-label">UV Index</span>
          <span class="detail-value">${Math.round(d.uv_index_max[0])}</span>
        </div>
        <div class="detail-extra uv-level ${uvName.toLowerCase().replace(" ", "-")}">${uvName}</div>
      </div>

      <div class="weather-detail-card">
        <div class="detail-icon precip"><i class="fa-solid fa-cloud-rain"></i></div>
        <div class="detail-info">
          <span class="detail-label">Precipitation</span>
          <span class="detail-value">${d.precipitation_probability_max[0]}%</span>
        </div>
        <div class="detail-extra">${d.precipitation_sum[0]}mm expected</div>
      </div>

      <div class="weather-detail-card sunrise-sunset">
        <div class="sun-times-visual">
          <div class="sun-time sunrise">
            <i class="fa-solid fa-sun"></i>
            <span class="sun-label">Sunrise</span>
            <span class="sun-value">${timeFromIso(d.sunrise[0])}</span>
          </div>
          <div class="sun-arc">
            <div class="sun-arc-path"></div>
            <div class="sun-position" style="--sun-progress: ${sunProgress(w)}%"></div>
          </div>
          <div class="sun-time sunset">
            <i class="fa-solid fa-moon"></i>
            <span class="sun-label">Sunset</span>
            <span class="sun-value">${timeFromIso(d.sunset[0])}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="weather-section">
      <h3 class="weather-section-title"><i class="fa-solid fa-clock"></i> Hourly Forecast</h3>
      <div class="hourly-scroll">${hourlyHtml(w)}</div>
    </div>

    <div class="weather-section">
      <h3 class="weather-section-title"><i class="fa-solid fa-calendar-week"></i> 7-Day Forecast</h3>
      <div class="forecast-list">${forecast}</div>
    </div>
  `;
}
function renderWeatherPage() {
  if (state.code === "") {
    weatherSelection.style.display = "none";
    weatherContent.innerHTML = `
      <div class="empty-state">
        <h3>No country selected</h3>
        <p>Choose a country from the Dashboard and press Explore.</p>
      </div>
    `;
    return;
  }

  weatherSelection.style.display = "flex";
  weatherSelection.innerHTML = `
    <div class="current-selection-badge">
      <img src="https://flagcdn.com/w40/${state.code.toLowerCase()}.png" alt="${state.name}" class="selection-flag">
      <span>${state.name}</span>
      ${state.city ? `<span class="selection-city">• ${state.city}</span>` : ""}
    </div>
  `;

  if (!state.weather) {
    weatherContent.innerHTML = `
      <div class="empty-state">
        <h3>Weather unavailable</h3>
        <p>We could not load the forecast for this location.</p>
      </div>
    `;
    return;
  }
  displayWeather(state.weather);
}

//=======sun time======
async function getSunTimes(lat, lon, date) {
  const response = await fetch(
    `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`,
  );
  if (!response.ok) throw new Error(`Sun times error ${response.status}`);

  const data = await response.json();
  if (data.status !== "OK") throw new Error("Sun times: bad status");
  return data.results;
}

function formatTime(iso, timeZone) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  });
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function displaySunTimes(r) {
  const tz = state.coords.timezone;
  const today = new Date();
  const dateText = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: tz,
  });
  const dayText = today.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: tz,
  });

  const percent = ((r.day_length / 86400) * 100).toFixed(1);

  sunContent.innerHTML = `
    <div class="sun-main-card">
      <div class="sun-main-header">
        <div class="sun-location">
          <h2><i class="fa-solid fa-location-dot"></i> ${state.coords.name}</h2>
          <p>Sun times for your selected location</p>
        </div>
        <div class="sun-date-display">
          <div class="date">${dateText}</div>
          <div class="day">${dayText}</div>
        </div>
      </div>

      <div class="sun-times-grid">
        <div class="sun-time-card dawn">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dawn</div>
          <div class="time">${formatTime(r.civil_twilight_begin, tz)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card sunrise">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunrise</div>
          <div class="time">${formatTime(r.sunrise, tz)}</div>
          <div class="sub-label">Golden Hour Start</div>
        </div>
        <div class="sun-time-card noon">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Solar Noon</div>
          <div class="time">${formatTime(r.solar_noon, tz)}</div>
          <div class="sub-label">Sun at Highest</div>
        </div>
        <div class="sun-time-card sunset">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunset</div>
          <div class="time">${formatTime(r.sunset, tz)}</div>
          <div class="sub-label">Golden Hour End</div>
        </div>
        <div class="sun-time-card dusk">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dusk</div>
          <div class="time">${formatTime(r.civil_twilight_end, tz)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>
        <div class="sun-time-card daylight">
          <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
          <div class="label">Day Length</div>
          <div class="time">${formatDuration(r.day_length)}</div>
          <div class="sub-label">Total Daylight</div>
        </div>
      </div>
    </div>

    <div class="day-length-card">
      <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
      <div class="day-progress">
        <div class="day-progress-bar">
          <div class="day-progress-fill" style="width: ${percent}%"></div>
        </div>
      </div>
      <div class="day-length-stats">
        <div class="day-stat"><div class="value">${formatDuration(r.day_length)}</div><div class="label">Daylight</div></div>
        <div class="day-stat"><div class="value">${percent}%</div><div class="label">of 24 Hours</div></div>
        <div class="day-stat"><div class="value">${formatDuration(86400 - r.day_length)}</div><div class="label">Darkness</div></div>
      </div>
    </div>
  `;
}

function renderSunTimesPage() {
  if (state.code === "") {
    sunSelection.style.display = "none";
    sunContent.innerHTML = `
      <div class="empty-state">
        <h3>No country selected</h3>
        <p>Choose a country from the Dashboard and press Explore.</p>
      </div>
    `;
    return;
  }

  sunSelection.style.display = "flex";
  sunSelection.innerHTML = `
    <div class="current-selection-badge">
      <img src="https://flagcdn.com/w40/${state.code.toLowerCase()}.png" alt="${state.name}" class="selection-flag">
      <span>${state.name}</span>
      ${state.city ? `<span class="selection-city">• ${state.city}</span>` : ""}
    </div>
  `;

  if (!state.sunTimes) {
    sunContent.innerHTML = `
      <div class="empty-state">
        <h3>Sun times unavailable</h3>
        <p>We could not load sun times for this location.</p>
      </div>
    `;
    return;
  }

  displaySunTimes(state.sunTimes);
}
//======= currency =========
const shortNames = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  EGP: "Egyptian Pound",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  INR: "Indian Rupee",
};
const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });

function currencyName(code) {
  if (shortNames[code]) return shortNames[code];
  try {
    return currencyNames.of(code) || code;
  } catch (error) {
    return code;
  }
}

async function getRates() {
  const cached = JSON.parse(localStorage.getItem("ratesCache"));
  if (cached && Date.now() - cached.savedAt < 6 * 60 * 60 * 1000) {
    return cached;
  }

  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) throw new Error(`Currency error ${response.status}`);

  const data = await response.json();
  if (data.result !== "success") throw new Error("Currency: bad result");

  const result = {
    rates: data.rates || data.conversion_rates,
    updated: data.time_last_update_utc,
    savedAt: Date.now(),
  };
  localStorage.setItem("ratesCache", JSON.stringify(result));
  return result;
}

function formatMoney(n) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fillCurrencySelects() {
  const options = Object.keys(rates)
    .sort()
    .map(function (code) {
      return `<option value="${code}">${code} - ${currencyName(code)}</option>`;
    })
    .join("");

  currencyFrom.innerHTML = options;
  currencyTo.innerHTML = options;
  currencyFrom.value = "USD";
  currencyTo.value = "EUR";
}
function renderConversion() {
  const amount = Number(currencyAmount.value);

  if (currencyAmount.value === "" || amount < 0) {
    currencyResult.innerHTML = `<div class="exchange-rate-info"><p>Enter a valid amount</p></div>`;
    return;
  }

  const from = currencyFrom.value;
  const to = currencyTo.value;
  const unitRate = rates[to] / rates[from];
  const updatedText = new Date(ratesUpdated).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  currencyResult.innerHTML = `
    <div class="conversion-display">
      <div class="conversion-from">
        <span class="amount">${formatMoney(amount)}</span>
        <span class="currency-code">${from}</span>
      </div>
      <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
      <div class="conversion-to">
        <span class="amount">${formatMoney(amount * unitRate)}</span>
        <span class="currency-code">${to}</span>
      </div>
    </div>
    <div class="exchange-rate-info">
      <p>1 ${from} = ${unitRate.toFixed(4)} ${to}</p>
      <small>Last updated: ${updatedText}</small><br>
      <small><a href="https://www.exchangerate-api.com" target="_blank">Rates By Exchange Rate API</a></small>
    </div>
  `;
}

const popularCurrencies = {
  EUR: "eu",
  GBP: "gb",
  EGP: "eg",
  AED: "ae",
  SAR: "sa",
  JPY: "jp",
  CAD: "ca",
  INR: "in",
  USD: "us",
};

function renderPopular() {
  const from = currencyFrom.value;

  popularGrid.innerHTML = Object.keys(popularCurrencies)
    .filter(function (code) {
      return code !== from && rates[code];
    })
    .map(function (code) {
      return `
        <div class="popular-currency-card">
          <img src="https://flagcdn.com/w40/${popularCurrencies[code]}.png" alt="${code}" class="flag">
          <div class="info"><div class="code">${code}</div><div class="name">${currencyName(code)}</div></div>
          <div class="rate">${(rates[code] / rates[from]).toFixed(4)}</div>
        </div>
      `;
    })
    .join("");
}

async function initCurrency() {
  try {
    const data = await getRates();
    rates = data.rates;
    ratesUpdated = data.updated;
    fillCurrencySelects();
    currencyResult.innerHTML = "";
    renderPopular();
  } catch (error) {
    console.error("Currency failed:", error);
    currencyResult.innerHTML = `
      <div class="empty-state">
        <h3>Rates unavailable</h3>
        <p>We could not load exchange rates. Please try again later.</p>
      </div>
    `;
  }
}
const clockEl = document.getElementById("current-datetime");

function updateClock() {
  clockEl.textContent = new Date().toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
updateClock();
setInterval(updateClock, 30000);

//======= events =========
const eventImages = {
  Music:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop",
  Arts: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=200&fit=crop",
  Symphony:
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&h=200&fit=crop",
};

function normalizeEvent(e) {
  const venue = e._embedded?.venues?.[0];
  return {
    id: e.id,
    name: e.name,
    category: e.classifications?.[0]?.segment?.name || "Event",
    date: e.dates?.start?.localDate || "",
    time: e.dates?.start?.localTime || "",
    venue: venue?.name || "Venue TBA",
    city: venue?.city?.name || "",
    image: e.images?.[0]?.url || eventImages.Music,
    url: e.url || "#",
    mock: false,
  };
}

async function getEvents(countryCode, city) {
  if (!TICKETMASTER_KEY) return [];

  const params = new URLSearchParams({
    apikey: TICKETMASTER_KEY,
    countryCode: countryCode,
    size: "20",
    sort: "date,asc",
  });
  if (city) params.set("city", city);

  const response = await fetch(
    `https://app.ticketmaster.com/discovery/v2/events.json?${params}`,
  );
  if (!response.ok) throw new Error(`Events error ${response.status}`);

  const data = await response.json();
  const list = data._embedded?.events || [];
  return list.map(normalizeEvent);
}

function mockEvents(place) {
  const templates = [
    {
      name: "Jazz Night Live",
      category: "Music",
      time: "20:00:00",
      venue: "City Concert Hall",
      image: eventImages.Music,
    },
    {
      name: "Football Match",
      category: "Sports",
      time: "19:00:00",
      venue: "National Stadium",
      image: eventImages.Sports,
    },
    {
      name: "Theatre Play",
      category: "Arts",
      time: "21:00:00",
      venue: "Cultural Center",
      image: eventImages.Arts,
    },
    {
      name: "Symphony Orchestra",
      category: "Music",
      time: "19:30:00",
      venue: "Opera House",
      image: eventImages.Symphony,
    },
  ];

  return templates.map(function (t, i) {
    const d = new Date();
    d.setDate(d.getDate() + 14 + i * 7);
    return {
      id: `mock-${state.code}-${i}`,
      name: `${t.name} in ${place}`,
      category: t.category,
      date: d.toISOString().slice(0, 10),
      time: t.time,
      venue: t.venue,
      city: place,
      image: t.image,
      url: "#",
      mock: true,
    };
  });
}
function eventDateText(ev) {
  if (!ev.date) return "Date TBA";
  return `${fullDate(ev.date)}${ev.time ? " at " + ev.time.slice(0, 5) : ""}`;
}

function displayEvents(list) {
  const note = list[0]?.mock
    ? `<p style="grid-column: 1 / -1; color: #64748b;">Showing sample events. Live events are unavailable for this location.</p>`
    : "";

  eventsContent.innerHTML =
    note +
    list
      .map(function (ev, index) {
        const heart = isSaved(`event-${ev.id}`) ? "fa-solid" : "fa-regular";
        return `
          <div class="event-card">
            <div class="event-card-image">
              <img src="${ev.image}" alt="${ev.name}">
              <span class="event-card-category">${ev.category}</span>
              <button class="event-card-save" data-index="${index}"><i class="${heart} fa-heart"></i></button>
            </div>
            <div class="event-card-body">
              <h3>${ev.name}</h3>
              <div class="event-card-info">
                <div><i class="fa-regular fa-calendar"></i>${eventDateText(ev)}</div>
                <div><i class="fa-solid fa-location-dot"></i>${ev.venue}${ev.city ? ", " + ev.city : ""}</div>
              </div>
              <div class="event-card-footer">
                <button class="btn-event" data-index="${index}"><i class="${heart} fa-heart"></i> Save</button>
                <a href="${ev.url}" target="_blank" class="btn-buy-ticket"><i class="fa-solid fa-ticket"></i> Buy Tickets</a>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
}

function renderEventsPage() {
  if (state.code === "") {
    eventsSelection.style.display = "none";
    eventsContent.innerHTML = `
      <div class="empty-state">
        <h3>No country selected</h3>
        <p>Choose a country from the Dashboard and press Explore.</p>
      </div>
    `;
    return;
  }

  eventsSelection.style.display = "flex";
  eventsSelection.innerHTML = `
    <div class="current-selection-badge">
      <img src="https://flagcdn.com/w40/${state.code.toLowerCase()}.png" alt="${state.name}" class="selection-flag">
      <span>${state.name}</span>
      ${state.city ? `<span class="selection-city">• ${state.city}</span>` : ""}
    </div>
  `;
  displayEvents(state.events);
}
//====== showView====
const viewInfo = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome back! Ready to plan your next adventure?",
  },
  holidays: {
    title: "Holidays",
    subtitle: "Explore public holidays around the world",
  },
  events: {
    title: "Events",
    subtitle: "Find concerts, sports and more",
  },
  weather: {
    title: "Weather",
    subtitle: "Check the forecast for your destination",
  },
  "long-weekends": {
    title: "Long Weekends",
    subtitle: "Find the best mini-trip opportunities",
  },
  currency: {
    title: "Currency",
    subtitle: "Convert currencies with live exchange rates",
  },
  "sun-times": {
    title: "Sun Times",
    subtitle: "Plan around sunrise and sunset",
  },
  "my-plans": {
    title: "My Plans",
    subtitle: "Your saved holidays, events and trips",
  },
};
function showView(viewName) {
  views.forEach(function (view) {
    view.classList.remove("active");
  });
  navItems.forEach(function (item) {
    item.classList.remove("active");
  });
  document.getElementById(`${viewName}-view`).classList.add("active");
  document
    .querySelector(`.nav-item[data-view="${viewName}"]`)
    .classList.add("active");
  pageTitle.textContent = viewInfo[viewName].title;
  pageSubtitle.textContent = viewInfo[viewName].subtitle;
  if (viewName === "holidays") renderHolidaysPage();
  if (viewName === "my-plans") renderPlansPage();
  if (viewName === "long-weekends") renderLongWeekendsPage();
  if (viewName === "weather") renderWeatherPage();
  if (viewName === "sun-times") renderSunTimesPage();
  if (viewName === "events") renderEventsPage();
}
function handleRoute() {
  toggleSidebar(false);
  let viewName = location.hash.replace("#/", "");
  if (!viewInfo[viewName]) {
    viewName = "dashboard";
  }
  showView(viewName);
}

navItems.forEach(function (item) {
  item.addEventListener("click", function (event) {
    event.preventDefault();
    location.hash = `/${item.dataset.view}`;
  });
});
// ===== Events =====
trigger.addEventListener("click", function () {
  panel.classList.toggle("hidden");
});

countrySelect.addEventListener("change", function () {
  const code = countrySelect.value;
  if (code === "") return;

  const name = countrySelect.options[countrySelect.selectedIndex].textContent;

  citySelect.value = "";
  cityName.textContent = "";

  flagImg.src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
  flagImg.alt = name;
  nameSpan.textContent = name;
});

citySelect.addEventListener("change", function () {
  const city = citySelect.value;
  cityName.textContent = city === "" ? "" : `• ${city}`;
});

async function loadDestination() {
  try {
    state.coords = await getCoordinates(state.code, state.name, state.city);
    state.weather = state.coords
      ? await getWeather(state.coords.lat, state.coords.lon)
      : null;
  } catch (error) {
    console.error("Weather failed:", error);
    state.coords = null;
    state.weather = null;
  }

  try {
    const holidays = await getHolidays(state.year, state.code);
    state.holidays = holidays;
    statHolidays.textContent = holidays.length;
  } catch (error) {
    console.error("Holidays failed:", error);
    state.holidays = [];
    statHolidays.textContent = 0;
  }

  try {
    state.longWeekends = await getLongWeekends(state.year, state.code);
  } catch (error) {
    console.error("Long weekends failed:", error);
    state.longWeekends = [];
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    state.sunTimes = state.coords
      ? await getSunTimes(state.coords.lat, state.coords.lon, today)
      : null;
  } catch (error) {
    console.error("Sun times failed:", error);
    state.sunTimes = null;
  }

  try {
    const found = await getEvents(state.code, state.city);
    state.events =
      found.length > 0 ? found : mockEvents(state.city || state.name);
  } catch (error) {
    console.error("Events failed:", error);
    state.events = mockEvents(state.city || state.name);
  }

  renderHolidaysPage();
  renderLongWeekendsPage();
  renderWeatherPage();
  renderSunTimesPage();
  renderEventsPage();
}

exploreBtn.addEventListener("click", async function () {
  const code = countrySelect.value;
  if (code === "") return;

  selectedBox.classList.remove("hidden");
  state.code = code;
  state.name = countrySelect.options[countrySelect.selectedIndex].textContent;
  state.city = citySelect.value.trim();
  state.year = yearSelect.value;

  setLoading(true, "Exploring your destination...");
  try {
    await loadDestination();
  } finally {
    setLoading(false);
  }
});

clearBtn.addEventListener("click", function () {
  countrySelect.value = "";
  citySelect.value = "";
  cityName.textContent = "";

  state.code = "";
  state.name = "";
  state.city = "";

  selectedBox.classList.add("hidden");
  triggerText.textContent = "Select Country";
  state.holidays = [];
  state.longWeekends = [];
  state.events = [];
  state.coords = null;
  state.weather = null;
  state.sunTimes = null;
});
countryList.addEventListener("click", function (event) {
  const item = event.target.closest(".cs-item");
  if (!item) return;
  const code = item.dataset.code;
  const name = item.querySelector("span").textContent;
  countrySelect.value = code;
  countrySelect.dispatchEvent(new Event("change"));

  triggerText.innerHTML = `<img class="cs-flag" src="https://flagcdn.com/w40/${code.toLowerCase()}.png" alt="${name}">
    ${name}
  `;
  searchInput.value = "";
  renderCountryList(allCountries);
  panel.classList.add("hidden");
});

searchInput.addEventListener("input", function () {
  const text = searchInput.value.toLowerCase().trim();
  const filtered = allCountries.filter(function (country) {
    return (
      country.name.toLowerCase().includes(text) ||
      country.countryCode.toLowerCase().includes(text)
    );
  });
  renderCountryList(filtered);
});

holidaysContent.addEventListener("click", function (event) {
  const btn = event.target.closest(".holiday-action-btn");
  if (!btn) return;

  const holiday = state.holidays[btn.dataset.index];
  if (!holiday) return;

  togglePlan({
    id: `holiday-${state.code}-${holiday.date}`,
    type: "holiday",
    title: holiday.localName,
    info: holiday.name,
    date: holiday.date,
    country: state.name,
    countryCode: state.code,
  });

  displayHolidays(state.holidays);
});

plansContent.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".plan-delete-btn");

  if (deleteBtn) {
    const plans = getPlans().filter((p) => p.id !== deleteBtn.dataset.id);
    savePlans(plans);
    updatePlansCount();
    renderPlansPage();
    return;
  }

  if (event.target.closest("#start-exploring-btn")) {
    location.hash = "/dashboard";
  }
});
planFilters.forEach(function (btn) {
  btn.addEventListener("click", function () {
    planFilters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.planFilter = btn.dataset.filter;
    renderPlansPage();
  });
});

clearAllBtn.addEventListener("click", function () {
  if (getPlans().length === 0) return;

  Swal.fire({
    title: "Clear all plans?",
    text: "This will remove everything you saved.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, clear all",
  }).then(function (result) {
    if (result.isConfirmed) {
      savePlans([]);
      updatePlansCount();
      renderPlansPage();
    }
  });
});

lwContent.addEventListener("click", function (event) {
  const btn = event.target.closest(".holiday-action-btn");
  if (!btn) return;

  const lw = state.longWeekends[btn.dataset.index];
  if (!lw) return;

  togglePlan({
    id: `lw-${state.code}-${lw.startDate}`,
    type: "longweekend",
    title: `${lw.dayCount} Day Long Weekend`,
    info: lw.needBridgeDays ? "Bridge day needed" : "No extra days off needed",
    date: lw.startDate,
    endDate: lw.endDate,
    country: state.name,
    countryCode: state.code,
  });

  displayLongWeekends(state.longWeekends);
});
convertBtn.addEventListener("click", function () {
  if (!rates) return;
  renderConversion();
  renderPopular();
});

swapBtn.addEventListener("click", function () {
  if (!rates) return;
  const temp = currencyFrom.value;
  currencyFrom.value = currencyTo.value;
  currencyTo.value = temp;
  renderConversion();
  renderPopular();
});

currencyFrom.addEventListener("change", function () {
  if (!rates) return;
  renderConversion();
  renderPopular();
});

currencyTo.addEventListener("change", function () {
  if (!rates) return;
  renderConversion();
});
eventsContent.addEventListener("click", function (event) {
  const btn = event.target.closest(".event-card-save, .btn-event");
  if (!btn) return;

  const ev = state.events[btn.dataset.index];
  if (!ev) return;

  togglePlan({
    id: `event-${ev.id}`,
    type: "event",
    title: ev.name,
    info: `${ev.venue}${ev.city ? ", " + ev.city : ""}`,
    date: ev.date,
    country: state.name,
    countryCode: state.code,
  });

  displayEvents(state.events);
});

document.addEventListener("click", function (event) {
  if (!event.target.closest("#country-dropdown")) {
    panel.classList.add("hidden");
  }
});

//======mobile sidebar=========
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const menuBtn = document.getElementById("mobile-menu-btn");
const OPEN_CLASS = "open";

sidebarOverlay.classList.remove("hidden");

function toggleSidebar(open) {
  sidebar.classList.toggle(OPEN_CLASS, open);
  sidebarOverlay.classList.toggle("active", open);
}

menuBtn.addEventListener("click", function () {
  toggleSidebar(!sidebar.classList.contains(OPEN_CLASS));
});

sidebarOverlay.addEventListener("click", function () {
  toggleSidebar(false);
});


document.querySelector("#weather-view .view-header-content p").textContent =
  "Check 7-day weather forecasts for cities around the world";
document.querySelector("#events-view .view-header-content p").textContent =
  "Discover concerts, sports, theatre and more around the world";
//=====================================
window.addEventListener("hashchange", handleRoute);
handleRoute();
renderHolidaysPage();
updatePlansCount();
renderLongWeekendsPage();
renderWeatherPage();
renderSunTimesPage();
initCurrency();
selectedBox.classList.add("hidden");
