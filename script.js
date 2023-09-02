const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const API_KEY = "b077oeftf49ab36d6631b0f3e4ab4d9a";

let weatherUrl = "";

let now = new Date();
let form = document.querySelector("#search-form");
let currentButton = document.getElementById("current-button");
let celciusLink = document.querySelector("#to-celcius");
let fahrenheitLink = document.querySelector("#to-fahrenheit");

form.addEventListener("submit", onSearch);
celciusLink.addEventListener("click", () => {
  showUnits("metric");
});
fahrenheitLink.addEventListener("click", () => {
  showUnits("imperial");
});
currentButton.addEventListener("click", getCurrentData);

function onSearch(event) {
  event.preventDefault();
  let searchInput = document.querySelector("#search-input");
  let city = searchInput.value.trim();
  city = format(city);

  if (city) {
    weatherUrl = `https://api.shecodes.io/weather/v1/current?query=${city}&key=${API_KEY}&units=metric`;
    axios.get(weatherUrl).then(logData);
  }
}

function getCurrentData() {
  navigator.geolocation.getCurrentPosition(handlePosition);
}

function handlePosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  weatherUrl = `https://api.shecodes.io/weather/v1/current?lon=${lon}&lat=${lat}&key=${API_KEY}`;
  axios.get(weatherUrl).then(logData);
}

function logData(response) {
  let currentTemperature = document.getElementById("current-temp");
  let weatherDescription = document.getElementById("weather-description");
  let cityHeading = document.querySelector("h1");
  let countryHeading = document.querySelector("h2");
  let humidity = document.getElementById("humidity");
  let wind = document.getElementById("wind");

  let icon = document.getElementById("current-weather-icon");
  let temperature = `${Math.round(response.data.temperature.current)}°C`;
  changeElementInnerHtml(cityHeading, response.data.city);
  changeElementInnerHtml(countryHeading, response.data.country);
  changeElementInnerHtml(currentTemperature, temperature);
  changeElementInnerHtml(humidity, response.data.temperature.humidity);
  changeElementInnerHtml(wind, response.data.wind.speed);
  changeElementInnerHtml(
    weatherDescription,
    response.data.condition.description
  );

  icon.setAttribute(
    "src",
    `http://shecodes-assets.s3.amazonaws.com/api/weather/icons/${response.data.condition.icon}.png`
  );

  let wUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=S4J8L7B44L2Z&format=json&by=position&lat=${response.data.coordinates.latitude}&lng=${response.data.coordinates.longitude}`;
  axios.get(wUrl).then(logTime);

  let fUrl = `https://api.shecodes.io/weather/v1/forecast?lat=${response.data.coordinates.latitude}&lon=${response.data.coordinates.longitude}&key=${API_KEY}&units=metric`;
  axios.get(fUrl).then(logForecast);
}

function logForecast(response) {
  console.log(response);
  let minTemp = document.getElementById("min-temp");
  let maxTemp = document.getElementById("max-temp");
  let minRounded = Math.round(response.data.daily[0].temperature.minimum);
  let maxRounded = Math.round(response.data.daily[0].temperature.maximum);
  console.log(response.data.daily[0]);
  changeElementInnerHtml(minTemp, minRounded);
  changeElementInnerHtml(maxTemp, maxRounded);
}

function logTime(response) {
  let currentTime = document.querySelector(".time");
  let date = response.data.formatted;
  let dateDay = new Date(response.data.timestamp * 1000 - 360000);
  let hours = date.slice(11, 13);
  let minutes = date.slice(14, 16);
  let selectedDay = document.querySelector("#today-day");
  let selectedDate = document.querySelector("#today-date");

  let day = DAYS[dateDay.getDay()];
  let month = MONTHS[dateDay.getMonth()];
  let dateN = dateDay.getDate();
  let year = dateDay.getFullYear();

  let dayString = `${day}, `;
  let dateString = `${month} ${dateN}, ${year}`;

  let time = `${hours}:${minutes}`;

  changeElementInnerHtml(selectedDay, dayString);
  changeElementInnerHtml(selectedDate, dateString);
  changeElementInnerHtml(currentTime, time);
}

function changeElementInnerHtml(el, content) {
  el.innerHTML = content;
}

function showUnits(units) {
  let currentTemperature = document.getElementById("current-temp");
  let windUnit = document.getElementById("wind-unit");
  let wind = document.getElementById("wind");
  let minTemp = document.getElementById("min-temp");
  let maxTemp = document.getElementById("max-temp");
  let minUnit = document.getElementById("min-unit");
  let maxUnit = document.getElementById("max-unit");
  let currentContent = currentTemperature.innerHTML;

  let unit = currentContent.charAt(currentContent.length - 1);
  let value = currentContent.slice(0, -2);
  if (unit !== "C" && units === "metric") {
    changeElementInnerHtml(
      currentTemperature,
      `${convertToCelcius(value).toFixed(0)}°C`
    );
    changeElementInnerHtml(
      minTemp,
      `${convertToCelcius(minTemp.innerHTML).toFixed(0)}`
    );
    changeElementInnerHtml(
      maxTemp,
      `${convertToCelcius(maxTemp.innerHTML).toFixed(0)}`
    );
    changeElementInnerHtml(minUnit, `°C`);
    changeElementInnerHtml(maxUnit, `°C`);
    changeElementInnerHtml(windUnit, `km/h`);
    changeElementInnerHtml(wind, convertToKmh(wind.innerHTML).toFixed(2));
  } else if (unit !== "F" && units === "imperial") {
    changeElementInnerHtml(
      currentTemperature,
      `${convertToFahrenheit(value).toFixed(0)}°F`
    );
    changeElementInnerHtml(
      minTemp,
      `${convertToFahrenheit(minTemp.innerHTML).toFixed(0)}`
    );
    changeElementInnerHtml(
      maxTemp,
      `${convertToFahrenheit(maxTemp.innerHTML).toFixed(0)}`
    );
    changeElementInnerHtml(minUnit, `°F`);
    changeElementInnerHtml(maxUnit, `°F`);
    changeElementInnerHtml(windUnit, `mph`);
    changeElementInnerHtml(wind, convertToMph(wind.innerHTML).toFixed(2));
  }
}

// function changeDateData(target_date) {
//   let selectedDay = document.querySelector("#today-day");
//   let selectedDate = document.querySelector("#today-date");
//   let day = DAYS[target_date.getDay()];
//   let month = MONTHS[target_date.getMonth()];
//   let date = target_date.getDate();
//   let year = target_date.getFullYear();

//   let dayString = `${day}, `;
//   let dateString = `${month} ${date}, ${year}`;

//   changeElementInnerHtml(selectedDay, dayString);
//   changeElementInnerHtml(selectedDate, dateString);
// }

//format text, convert to Fahrenheit, showAlert functions
function format(city) {
  let words = city.split(" ");
  let capitalisedWords = [];
  words.forEach((word) => {
    let firstLetter = word.charAt(0);
    firstLetter = firstLetter.toUpperCase();
    word = word.slice(1);
    word = firstLetter + word;
    capitalisedWords.push(word);
  });

  city = capitalisedWords.join(" ");

  return city;
}

function convertToMph(kmh) {
  return kmh / 1.609344;
}

function convertToKmh(mph) {
  return mph * 1.609344;
}

//(9/5)*t°C+32
function convertToFahrenheit(celcius) {
  return (9 / 5) * celcius + 32;
}

function convertToCelcius(fahr) {
  return (fahr - 32) / (9 / 5);
}

// changeDateData(now);
// changeTime();
getCurrentData();
