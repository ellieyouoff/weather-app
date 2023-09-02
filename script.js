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
const API_KEY = "ce144f0cf51fa43f03431f0488a36728";

let geoUrl = "",
  weatherUrl = "";

let now = new Date();
let form = document.querySelector("#search-form");
let currentButton = document.getElementById("current-button");
let celciusLink = document.querySelector("#to-celcius");
let fahrenheitLink = document.querySelector("#to-fahrenheit");

form.addEventListener("submit", onSearch);
celciusLink.addEventListener("click", showCelcius);
fahrenheitLink.addEventListener("click", showFahrenheit);
currentButton.addEventListener("click", getCurrentData);

changeDateData(now);
changeTime();
getCurrentData();

function onSearch(event) {
  event.preventDefault();
  let searchInput = document.querySelector("#search-input");
  let city = searchInput.value.trim();
  city = format(city);

  if (city) {
    geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${API_KEY}`;
    processGeoData(geoUrl);
  }
}

function getCurrentData() {
  navigator.geolocation.getCurrentPosition(handlePosition);
}

function handlePosition(position) {
  let lat = position.coords.latitude;
  let lon = position.coords.longitude;
  weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  axios.get(weatherUrl).then(logTemp);
  let reverseGeoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  axios.get(reverseGeoUrl).then(logCity);
}

function processGeoData(geoUrl) {
  axios.get(geoUrl).then(logCity);
  axios.get(geoUrl).then(getGeo);
}
function getGeo(response) {
  let lat = response.data[0].lat;
  let lon = response.data[0].lon;
  showWeather(lat, lon);
}

function showWeather(lat, lon) {
  weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  axios.get(weatherUrl).then(logTemp);
}

function logCity(response) {
  let cityHeading = document.querySelector("h1");
  let countryHeading = document.querySelector("h2");
  changeElementInnerHtml(cityHeading, response.data[0].name);
  changeElementInnerHtml(countryHeading, response.data[0].country);
}

function logTemp(response) {
  let currentTemperature = document.getElementById("current-temp");
  let temperature = `${Math.round(response.data.main.temp)}°C`;
  changeElementInnerHtml(currentTemperature, temperature);
}

function changeElementInnerHtml(el, content) {
  el.innerHTML = content;
}

function showCelcius() {
  let currentTemperature = document.getElementById("current-temp");
  let content = currentTemperature.innerHTML;
  let unit = content.charAt(content.length - 1);
  let value = content.slice(0, -2);
  if (unit !== "C") {
    content = `${convertToCelcius(value).toFixed(0)}°C`;
  }
  changeElementInnerHtml(currentTemperature, content);
  currentTemperature.innerHTML = content;
}

function showFahrenheit() {
  let currentTemperature = document.getElementById("current-temp");
  let content = currentTemperature.innerHTML;
  let unit = content.charAt(content.length - 1);
  let value = content.slice(0, -2);
  if (unit !== "F") {
    content = `${convertToFahrenheit(value).toFixed(0)}°F`;
  }
  changeElementInnerHtml(currentTemperature, content);
}

function changeDateData(target_date) {
  let selectedDay = document.querySelector("#today-day");
  let selectedDate = document.querySelector("#today-date");
  let day = DAYS[target_date.getDay()];
  let month = MONTHS[target_date.getMonth()];
  let date = target_date.getDate();
  let year = target_date.getFullYear();

  let dayString = `${day}, `;
  let dateString = `${month} ${date}, ${year}`;

  changeElementInnerHtml(selectedDay, dayString);
  changeElementInnerHtml(selectedDate, dateString);
}

function changeTime() {
  let currentTime = document.querySelector(".time");
  let hours = (now.getHours() < 10 ? "0" : "") + now.getHours();
  let minutes = (now.getMinutes() < 10 ? "0" : "") + now.getMinutes();
  let time = `${hours}:${minutes}`;
  changeElementInnerHtml(currentTime, time);
}

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

//(9/5)*t°C+32
function convertToFahrenheit(celcius) {
  return (9 / 5) * celcius + 32;
}

function convertToCelcius(fahr) {
  return (fahr - 32) / (9 / 5);
}
