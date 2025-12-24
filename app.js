const searchBar = document.querySelector('.search-bar');

async function searchResults(searchStr) {
    const resultsBar = document.querySelector('.results-bar');
    resultsBar.style.display = 'none';
    resultsBar.innerHTML = '';
    if (searchStr.length <= 1) {
        return;
    }
    // loading bar DOM code
    let loadingContainer = document.createElement("div");
    const loadingImg = document.createElement("img");
    const loadingText = document.createElement("p");
    loadingImg.src = "assets/images/icon-loading.svg";
    loadingImg.classList.add('loading-img');
    loadingText.innerHTML = "Search in progress";
    loadingContainer.classList.add('result-container');
    loadingContainer.appendChild(loadingImg);
    loadingContainer.appendChild(loadingText);
    resultsBar.appendChild(loadingContainer);
    resultsBar.style.display = 'flex';


    const geocodingDataRaw = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${searchStr}&count=10&language=en&format=json`);
    const geoCodingDataClean = await geocodingDataRaw.json();
    const geoCodingData = geoCodingDataClean.results;
    loadingContainer = document.querySelector('.result-container');
    resultsBar.removeChild(loadingContainer);
    resultsBar.style.display = 'none';
    for (i = 0; i < 5; i++) {
        const locationContainer = document.createElement('div');
        const countryFlag = document.createElement("img")
        countryFlag.classList.add('country-flag');
        countryFlag.src = `https://flagcdn.com/256x192/${geoCodingData[i].country_code.toLowerCase()}.png`;
        const locationData = document.createElement('p');
        locationData.innerHTML = `${geoCodingData[i].name}, ${geoCodingData[i].country}`;
        locationContainer.appendChild(countryFlag);
        locationContainer.appendChild(locationData);
        locationContainer.classList.add('result-container');
        locationContainer.dataset.latitude = geoCodingData[i].latitude;
        locationContainer.dataset.longitude = geoCodingData[i].longitude;
        resultsBar.appendChild(locationContainer);
    }
    resultsBar.style.display = 'flex';
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

// reference code

// async function testCall() {
//     const locationDataRaw = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=Mexia&count=10&language=en&format=json');
//     const locationData = await locationDataRaw.json();
//     console.log(locationData.results[0]);
//     const coordinates = [locationData.results[0].latitude, locationData.results[0].longitude];
//     const mexiaWeatherDataRaw = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordinates[0]}&longitude=${coordinates[1]}&current=temperature_2m&temperature_unit=fahrenheit`);
//     const mexiaWeatherData = await mexiaWeatherDataRaw.json();
// };

// testCall();

// console.log(circle.dataset.latitude, circle.dataset.longitude);