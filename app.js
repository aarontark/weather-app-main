const searchBar = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-button');
const dateDisplay = document.querySelector('.date');

// set dates
const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const currentDate = new Date();
const month = currentDate.getUTCMonth();
const day = currentDate.getUTCDay();
const year = currentDate.getUTCFullYear();
dateDisplay.innerHTML = `${weekday[day]}, ${months[month]} ${currentDate.getUTCDate()}, ${year}`;

navigator.geolocation.getCurrentPosition(
    (position) => {
        fetchCurrentWeather(position.coords.latitude, position.coords.longitude, true);
        fetchDailyWeather(position.coords.latitude, position.coords.longitude, true);
    },
    (error) => {
    // if rejected, display berlin weather
        fetchCurrentWeather(52.52, 13.41, false);
        fetchDailyWeather(52.52, 13.41, false);
    }
);

// async function fetchUserLocation(latitude, longitude) {
//     const userLocationRaw = 
// }


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
      const latitude = geoCodingData[i].latitude;
      const longitude = geoCodingData[i].longitude;
      locationContainer.addEventListener("mousedown", () => {
        fetchCurrentWeather(latitude, longitude, false);
        fetchDailyWeather(latitude, longitude, false);
        searchBar.value = locationData.innerHTML;
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


async function fetchCurrentWeather(latitude, longitude, isCurrentLocation) {
    // fetch data
    const currentWeatherRaw = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=weather_code,temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`);
    const currentWeatherClean = await currentWeatherRaw.json();
    const currentWeather = currentWeatherClean.current;
    const currentWeatherUnits = currentWeatherClean.current_units;
    // create DOM variables
    const locationDisplay = document.querySelector('.location');
    const weatherImg = document.querySelector('.main-weather-img');
    const currentTemp = document.querySelector('.main-temp-display');
    const feelsLikeDisplay = document.querySelector('.feels-like-display');
    const humidityDisplay = document.querySelector('.humidity-display');
    const windDisplay = document.querySelector('.wind-display');
    const precipDisplay = document.querySelector('.precipitation-display');

    if (isCurrentLocation) {
        locationDisplay.innerHTML = 'Current Location';
    } else {
        locationDisplay.innerHTML = searchBar.value || 'Berlin, Germany';
    }

    weatherImg.src = observeWeatherCode(currentWeather.weather_code);
    currentTemp.innerHTML = `${Math.round(currentWeather.temperature_2m)}°`;
    feelsLikeDisplay.innerHTML = `${Math.round(currentWeather.apparent_temperature)}°`;
    humidityDisplay.innerHTML = `${Math.round(currentWeather.relative_humidity_2m)}%`;
    windDisplay.innerHTML = `${Math.round(currentWeather.wind_speed_10m)} ${currentWeatherUnits.wind_speed_10m}`;
    precipDisplay.innerHTML = `${Math.round(currentWeather.precipitation)} ${currentWeatherUnits.precipitation}`;
}

async function fetchDailyWeather(latitude, longitude) {
    // fetch and handle data
    const dailyWeatherRaw = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`);
    const dailyWeatherClean = await dailyWeatherRaw.json();
    const dailyWeather = dailyWeatherClean.daily;
    const timeStamps = dailyWeather.time;
    const weatherCodes = dailyWeather.weather_code;
    const maxTemps = dailyWeather.temperature_2m_max;
    const minTemps = dailyWeather.temperature_2m_min;

    console.log(timeStamps);

    // create dom variables
    const dayDisplays = document.querySelectorAll('.weekday');
    const codeDisplays = document.querySelectorAll('.daily-img');
    const maxDisplays = document.querySelectorAll('.high');
    const minDisplays = document.querySelectorAll('.low');
    console.log(codeDisplays);
    console.log(weatherCodes);

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