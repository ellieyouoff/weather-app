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
let search = document.querySelector(".search");
let celciusLink = document.querySelector("#to-celcius");
let fahrenheitLink = document.querySelector("#to-fahrenheit");
document.addEventListener("click", (e) => {
  if (e.target.nodeName === "BODY") {
    search.classList.remove("active");
  }
});

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
  form.reset();

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
  console.log(response.data.condition.icon);

  icon.setAttribute("src", `./icons/${response.data.condition.icon}.svg`);

  let wUrl = `https://api.timezonedb.com/v2.1/get-time-zone?key=S4J8L7B44L2Z&format=json&by=position&lat=${response.data.coordinates.latitude}&lng=${response.data.coordinates.longitude}`;
  axios.get(wUrl).then(logTime);

  let fUrl = `https://api.shecodes.io/weather/v1/forecast?lat=${response.data.coordinates.latitude}&lon=${response.data.coordinates.longitude}&key=${API_KEY}&units=metric`;
  axios.get(fUrl).then(logForecast);
}

function logForecast(response) {
  let forecastElement = document.querySelector(".schedule");
  let forecast = [];
  let forecastHtml = ``;
  console.log(response.data);

  let dayIndex = new Date(response.data.daily[0].time * 1000).getDay();

  let dayStr;

  dayIndex += 1;

  for (let i = 0; i < 5; i++) {
    dayStr = DAYS[dayIndex];
    console.log(dayStr);

    forecast.push(`
   <li
            class="schedule-card rounded d-flex flex-column align-items-center p-2"
          >
            <div class="list-item-content">
              <div class="day">${dayStr.slice(0, 3)}</div>
              <img
                class="weather-icon"
                src="./icons/${
                  response.data.daily[dayIndex].condition.icon
                }.svg"
                alt="forecast weather"
              />
              <div class="forecast-temp">
                <span class="max-daily daily-units">${Math.round(
                  response.data.daily[dayIndex].temperature.maximum
                )}°C</span>
                <span class="min-daily daily-units">${Math.round(
                  response.data.daily[dayIndex].temperature.minimum
                )}°C</span>
              </div>
            </div>
          </li>
          `);
    if (dayIndex === 6) {
      dayIndex = 0;
    } else {
      dayIndex++;
    }
    if (i !== 4) {
      forecast.push(`
            <div class="divider"></div>`);
    }
  }

  for (let i = 0; i < forecast.length; i++) {
    forecastHtml += forecast[i];
  }

  forecastElement.innerHTML = forecastHtml;

  let minTemp = document.getElementById("min-temp");
  let maxTemp = document.getElementById("max-temp");
  let minRounded = Math.round(response.data.daily[0].temperature.minimum);
  let maxRounded = Math.round(response.data.daily[0].temperature.maximum);
  changeElementInnerHtml(minTemp, minRounded);
  changeElementInnerHtml(maxTemp, maxRounded);
}

// function displayForecastHtml() {
//   let forecastElement = document.querySelector(".schedule");

//   let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

//   let forecastHtml = ``;

//   days.forEach((day) => {
//     forecastHtml += `
//    <li
//             class="schedule-card rounded d-flex flex-column align-items-center p-2"
//           >
//             <div class="list-item-content">
//               <div class="day">${day}</div>
//               <img
//                 class="weather-icon"
//                 src="./icons/clear-sky-day.svg"
//                 alt="forecast weather"
//               />
//               <div class="forecast-temp">
//                 <span class="max-daily">18°C</span>
//                 <span class="min-daily">12°C</span>
//               </div>
//             </div>
//           </li>
//           <div class="divider"></div>`;
//   });

//   forecastElement.innerHTML = forecastHtml;
// }

// displayForecastHtml();

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
  let dailyUnits = document.querySelectorAll(".daily-units");
  let fahrLink = document.getElementById("to-fahrenheit");
  let celLink = document.getElementById("to-celcius");

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
    dailyUnits.forEach((el) => {
      let num = el.innerHTML.substring(0, el.innerHTML.length - 2);

      changeElementInnerHtml(el, `${convertToCelcius(num).toFixed(0)}°C`);
    });
    celLink.style.color = "#0c66b4";
    fahrLink.style.color = "#69b5f8";
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
    dailyUnits.forEach((el) => {
      let num = el.innerHTML.substring(0, el.innerHTML.length - 2);

      changeElementInnerHtml(el, `${convertToFahrenheit(num).toFixed(0)}°F`);
    });
    celLink.style.color = "#69b5f8";
    fahrLink.style.color = "#0c66b4";
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
