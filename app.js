const searchBar = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-button');
const dateDisplay = document.querySelector('.date');
const unitsDropdown = document.querySelector('.units-dropdown');
const unitsDropdownIcon = document.querySelector('.dropdown-img');
const unitsMenu = document.querySelector('.units-dropdown-container');
const unitSwitch = document.querySelector('.unit-switch');
const celsiusSwitch = document.querySelector('.celsius');
const fahrenSwitch = document.querySelector('.fahrenheit');
const locationDisplay = document.querySelector(".location");
let hourlyWeatherData = {};

// set dates
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentDate = new Date();
const month = currentDate.getUTCMonth();
const day = currentDate.getUTCDay();
const year = currentDate.getUTCFullYear();
dateDisplay.innerHTML = `${weekday[day]}, ${months[month]} ${currentDate.getUTCDate()}, ${year}`;

// set default units
let windSpeed = false;
let tempUnit = false;
let precipUnit = false;

let latitude;
let longitude;

// initial API call

navigator.geolocation.getCurrentPosition(
    (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        fetchCurrentWeather(latitude, longitude);
        fetchDailyWeather(latitude, longitude);
        fetchHourlyWeather(latitude, longitude);
        locationDisplay.innerHTML = "Current Location";
    },
    (error) => {
    // if rejected, display berlin weather
        latitude = 52.52;
        longitude = 13.41;
        fetchCurrentWeather(latitude, longitude);
        fetchDailyWeather(latitude, longitude);
        fetchHourlyWeather(latitude, longitude);
        locationDisplay.innerHTML = "Berlin, Germany";
    }
);

unitsDropdown.addEventListener('click', () => {
    unitsMenu.style.display = unitsMenu.style.display == 'flex' ? 'none' : 'flex';
    if (unitsMenu.style.display == "flex") {
        unitsDropdownIcon.classList.add("half-spin-anim");
    } else {
        unitsDropdownIcon.classList.remove("half-spin-anim");
    }
})

unitSwitch.addEventListener('click', () => {
    if (unitSwitch.classList.contains('metric')) {
        windSpeed = true;
        tempUnit = true;
        precipUnit = true;
        unitSwitch.classList.remove('metric');
        unitSwitch.innerHTML = 'Switch to Metric';
    } else {
        windSpeed = false;
        tempUnit = false;
        precipUnit = false;
        unitSwitch.classList.add('metric');
        unitSwitch.innerHTML = 'Switch to Imperial';
    }

    fetchCurrentWeather(latitude, longitude);
    fetchDailyWeather(latitude, longitude);
    fetchHourlyWeather(latitude, longitude);
})

celsiusSwitch.addEventListener('click', () => {
    tempUnit = false;
    let checkmark = celsiusSwitch.querySelector('img');
    checkmark.style.display = 'block';
    checkmark = fahrenSwitch.querySelector('img');
    checkmark.style.display = 'none';
    fetchCurrentWeather(latitude, longitude);
    fetchDailyWeather(latitude, longitude);
    fetchHourlyWeather(latitude, longitude);
})

fahrenSwitch.addEventListener('click', () => {
    tempUnit = true;
    let checkmark = fahrenSwitch.querySelector('img');
    checkmark.style.display = 'block';
    checkmark = celsiusSwitch.querySelector('img');
    checkmark.style.display = 'none';
    fetchCurrentWeather(latitude, longitude);
    fetchDailyWeather(latitude, longitude);
    fetchHourlyWeather(latitude, longitude);
})


async function searchResults(searchStr) {
    const resultsBar = document.querySelector('.results-bar');
    resultsBar.style.display = 'none';
    resultsBar.innerHTML = '';
    if (searchStr.length <= 1) {
        return;
    }

    searchLoadRender(resultsBar);

    const geocodingDataRaw = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchStr}&count=10&language=en&format=json`);
    const geoCodingDataClean = await geocodingDataRaw.json();
    const geoCodingData = geoCodingDataClean.results;

    const loadingContainer = document.querySelector('.result-container');
    resultsBar.removeChild(loadingContainer);
    resultsBar.style.display = 'none';
    searchResultRender(resultsBar, geoCodingData);
    resultsBar.style.display = 'flex';
}

const searchLoadRender = (resultsBar) => {
    const loadingContainer = document.createElement("div");
    const loadingImg = document.createElement("img");
    const loadingText = document.createElement("p");
    loadingImg.src = "assets/images/icon-loading.svg";
    loadingImg.classList.add("loading-img");
    loadingText.innerHTML = "Search in progress";
    loadingContainer.classList.add("result-container");
    loadingContainer.appendChild(loadingImg);
    loadingContainer.appendChild(loadingText);
    resultsBar.appendChild(loadingContainer);
    resultsBar.style.display = "flex";
}

const searchResultRender = (resultsBar, geoCodingData) => {
    for (i = 0; i < 5; i++) {
      const locationContainer = document.createElement("div");
      const countryFlag = document.createElement("img");
      countryFlag.classList.add("country-flag");
      countryFlag.src = `https://flagcdn.com/256x192/${geoCodingData[i].country_code.toLowerCase()}.png`;
      const locationData = document.createElement("p");
      locationData.innerHTML = `${geoCodingData[i].name}, ${geoCodingData[i].country}`;
      locationContainer.appendChild(countryFlag);
      locationContainer.appendChild(locationData);
      locationContainer.classList.add("result-container");
      latitude = geoCodingData[i].latitude;
      longitude = geoCodingData[i].longitude;
      locationContainer.addEventListener("mousedown", () => {
        fetchCurrentWeather(latitude, longitude);
        fetchDailyWeather(latitude, longitude);
        fetchHourlyWeather(latitude, longitude);
        searchBar.value = locationData.innerHTML;
        locationDisplay.innerHTML = searchBar.value;
      });
      resultsBar.appendChild(locationContainer);
    }
}

searchBar.addEventListener('input', () => {
    searchResults(searchBar.value);
})

searchBar.addEventListener('focus', () => {
    searchResults(searchBar.value);
})

searchBar.addEventListener('blur', () => {
    const resultsBar = document.querySelector('.results-bar');
    resultsBar.style.display = 'none';
})

searchBtn.addEventListener('click', () => {
    searchBar.focus();
})

function observeWeatherCode (weatherCode){
    if (weatherCode == 0 || weatherCode == 1) {
        return './assets/images/icon-sunny.webp';
    } else if (weatherCode == 2) {
        return './assets/images/icon-partly-cloudy.webp';
    } else if (weatherCode == 3) {
        return './assets/images/icon-overcast.webp';
    } else if (weatherCode >= 45 && weatherCode <= 48) {
        return "./assets/images/icon-fog.webp";
    } else if (weatherCode >= 51 && weatherCode <= 57) {
        return "./assets/images/icon-drizzle.webp";
    } else if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
        return "./assets/images/icon-rain.webp";
    } else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
        return "./assets/images/icon-snow.webp";
    } else if (weatherCode >= 95 && weatherCode <= 99) {
        return "./assets/images/icon-storm.webp";
    }
}


async function fetchCurrentWeather(latitude, longitude) {
    let endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m`;
    if (windSpeed) {
        endpoint += "&wind_speed_unit=mph";
    }
    if (tempUnit) {
        endpoint += "&temperature_unit=fahrenheit";
    }
    if (precipUnit) {
        endpoint += "&precipitation_unit=inch";
    }
    // fetch data
    const currentWeatherRaw = await fetch(endpoint);
    const currentWeatherClean = await currentWeatherRaw.json();
    const currentWeather = currentWeatherClean.current;
    const currentWeatherUnits = currentWeatherClean.current_units;
    // create DOM variables
    const weatherImg = document.querySelector('.main-weather-img');
    const currentTemp = document.querySelector('.main-temp-display');
    const feelsLikeDisplay = document.querySelector('.feels-like-display');
    const humidityDisplay = document.querySelector('.humidity-display');
    const windDisplay = document.querySelector('.wind-display');
    const precipDisplay = document.querySelector('.precipitation-display');

    weatherImg.src = observeWeatherCode(currentWeather.weather_code);
    currentTemp.innerHTML = `${Math.round(currentWeather.temperature_2m)}°`;
    feelsLikeDisplay.innerHTML = `${Math.round(currentWeather.apparent_temperature)}°`;
    humidityDisplay.innerHTML = `${Math.round(currentWeather.relative_humidity_2m)}%`;
    windDisplay.innerHTML = `${Math.round(currentWeather.wind_speed_10m)} ${currentWeatherUnits.wind_speed_10m}`;
    precipDisplay.innerHTML = `${Math.round(currentWeather.precipitation)} ${currentWeatherUnits.precipitation}`;
}

async function fetchDailyWeather(latitude, longitude) {
    // fetch and handle data
    let endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    if (tempUnit) {
        endpoint += "&temperature_unit=fahrenheit";
    }
    const dailyWeatherRaw = await fetch(endpoint);
    const dailyWeatherClean = await dailyWeatherRaw.json();
    const dailyWeather = dailyWeatherClean.daily;
    const timeStamps = dailyWeather.time;
    const weatherCodes = dailyWeather.weather_code;
    const maxTemps = dailyWeather.temperature_2m_max;
    const minTemps = dailyWeather.temperature_2m_min;

    // create dom variables
    const dayDisplays = document.querySelectorAll('.weekday');
    const codeDisplays = document.querySelectorAll('.daily-img');
    const maxDisplays = document.querySelectorAll('.high');
    const minDisplays = document.querySelectorAll('.low');

    // render data
    for (i = 0; i < 7; i++) {
        const [year, month, day] = timeStamps[i].split('-');
        const dateObj = new Date(year, month - 1, day);
        const currentDay = dateObj.toString().slice(0, 3);
        dayDisplays[i].innerHTML = currentDay;
        codeDisplays[i].src = observeWeatherCode(weatherCodes[i]);
        maxDisplays[i].innerHTML = `${Math.round(maxTemps[i])}°`;
        minDisplays[i].innerHTML = `${Math.round(minTemps[i])}°`;
    }
}

async function fetchHourlyWeather(latitude, longitude) {
    let endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&timezone=auto`;
    if (tempUnit) {
        endpoint += "&temperature_unit=fahrenheit";
    }
    const hourlyWeatherRaw = await fetch(endpoint);
    const hourlyWeatherClean = await hourlyWeatherRaw.json();
    const hourlyWeather = hourlyWeatherClean.hourly;
	for (let i = 0; i < hourlyWeather.time.length; i++) {
		const newDate = (new Date(hourlyWeather.time[i])).toString();
		const dayKey = newDate.slice(0, 3);
		const hourMilitary = newDate.slice(16, 18);
		const hourStandard = hourMilitary % 12 || 12;
		let timeIdentifier = hourMilitary >= 12 ? 'PM' : 'AM';
		if (!hourlyWeatherData[dayKey]) {
      		hourlyWeatherData[dayKey] = {};
    	}
		hourlyWeatherData[dayKey][`${hourStandard} ${timeIdentifier}`] = [hourlyWeather.temperature_2m[i], hourlyWeather.weather_code[i]];
	}
    let currentDay;
    for (elem of weekday) {
        if (Object.keys(hourlyWeatherData)[0] == elem.slice(0, 3)) {
            currentDay = elem.slice(0, 3);
        }
    }
    let iterator = 0;
    for (key in hourlyWeatherData) {
        for (elem of weekday) {
            if (elem.slice(0, 3) == key) {
                daySelectors[iterator].innerHTML = elem;
            }
        }
        iterator++;
    }
    renderHourlyData(hourlyWeatherData, currentDay);
}



function renderHourlyData(hourlyWeatherData, day) {
    // set dom variables
    const iconDisplay = document.querySelectorAll('.hourly-icon');
    const timeDisplay = document.querySelectorAll('.hourly-time');
    const tempDisplay = document.querySelectorAll('.hourly-temp');
    const currentDay = hourlyWeatherData[day];
    let iterator = 0;
    for (key in currentDay) {
        iconDisplay[iterator].src = observeWeatherCode(currentDay[key][1]);
        timeDisplay[iterator].innerHTML = key;
        tempDisplay[iterator].innerHTML = `${Math.round(currentDay[key][0])}°`;
        iterator++;
    }
    for (elem of weekday) {
        if (elem.slice(0, 3) == day) {
            currentDayDisplay.innerHTML = elem;
        }
    }
}

const dayDropdown = document.querySelector('.day-selector');
const dayOptions = document.querySelector('.day-options');
const daySelectors = document.querySelectorAll('.day');
const currentDayDisplay = document.querySelector(".day-option");
const dropdownIcon = document.querySelector('.day-icon');

for (daySelector of daySelectors) {
    daySelector.addEventListener("click", (event) => {
        renderHourlyData(hourlyWeatherData, event.target.innerHTML.slice(0, 3));
        dayOptions.style.display = 'none';
        dropdownIcon.classList.remove('half-spin-anim');
    });
}

dayDropdown.addEventListener('click', () => {
    dayOptions.style.display = dayOptions.style.display == 'flex' ? 'none' : 'flex';
    if (dayOptions.style.display == 'flex') {
        dropdownIcon.classList.add('half-spin-anim');
    } else {
        dropdownIcon.classList.remove('half-spin-anim');
    }
})