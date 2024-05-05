/*
  Copyright 2024 Teal Penguin

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import GLib from "gi://GLib";
import Soup from "gi://Soup";
import { getSoupSession } from "./myloc.js"
import { getIconName, gettextCondition } from "./weathericons.js"

export const OPENWEATHERMAP_KEY = "b4d6a638dd4af5e668ccd8574fd90cec";
export const WEATHERAPI_KEY = "7a4baea97ef946c7864221259240804";

/**
  * @enum {number}
  */
export const WeatherProvider =
{
  DEFAULT: 0,
  OPENWEATHERMAP: 1,
  WEATHERAPICOM: 2
};

export function getWeatherProviderName(prov)
{
  switch(prov)
  {
    case WeatherProvider.DEFAULT:
    case WeatherProvider.OPENWEATHERMAP:
      return "OpenWeatherMap";
    case WeatherProvider.WEATHERAPICOM:
      return "WeatherAPI.com";
    default:
      return null;
  }
}

export function getWeatherProviderUrl(prov)
{
  switch(prov)
  {
    case WeatherProvider.DEFAULT:
    case WeatherProvider.OPENWEATHERMAP:
      return "https://openweathermap.org/";
    case WeatherProvider.WEATHERAPICOM:
      return "https://www.weatherapi.com/";
    default:
      return null;
  }
}

export function getUseDefaultKeySetting(prov)
{
  switch(prov)
  {
    case WeatherProvider.DEFAULT:
    case WeatherProvider.OPENWEATHERMAP:
      return "use-default-owm-key";
    case WeatherProvider.WEATHERAPICOM:
      return "use-default-weatherapidotcom-key";
    default:
      return null;
  }
}

export function getCustomKeySetting(prov)
{
  switch(prov)
  {
    case WeatherProvider.DEFAULT:
    case WeatherProvider.OPENWEATHERMAP:
      return "appid";
    case WeatherProvider.WEATHERAPICOM:
      return "weatherapidotcom-key";
    default:
      return null;
  }
}

export class Weather
{
  #iconName;
  #condition;

  #tempC;
  #feelsLikeC;
  #humidityPercent;
  #pressureMBar;
  #windMps;
  #windDirDeg;
  #gustsMps;

  #sunrise;
  #sunset;

  #forecasts;

  /**
    * @param {number} tempC 
    * @param {number} feelsLikeC
    * @param {number} humidityPercent
    * @param {number} pressureMBar
    * @param {number} windMps
    * @param {number} windDirDeg
    * @param {number} gustsMps
    * @param {string} iconName
    * @param {string} condition
    * @param {Date} sunrise
    * @param {Date} sunset
    * @param {(Forecast[][] | null)} forecasts
    */
  constructor(tempC, feelsLikeC, humidityPercent, pressureMBar, windMps, windDirDeg, gustsMps, iconName, condition, sunrise, sunset, forecasts = null)
  {
    this.#tempC = tempC;
    this.#feelsLikeC = feelsLikeC;
    this.#humidityPercent = humidityPercent;
    this.#pressureMBar = pressureMBar;
    this.#windMps = windMps;
    this.#windDirDeg = windDirDeg;
    this.#gustsMps = gustsMps;
    this.#iconName = iconName;
    this.#condition = condition;
    this.#sunrise = sunrise;
    this.#sunset = sunset;
    this.#forecasts = forecasts ? forecasts.length > 0 ? forecasts : null : null;
  }

  /**
    * @returns {string}
    */
  getIconName()
  {
    return this.#iconName;
  }

  /**
    * @returns {string}
    */
  displayCondition()
  {
    return this.#condition;
  }

  /**
    * @returns {string}
    */
  displayTemperature(extension)
  {
    return extension.formatTemperature(this.#tempC);
  }

  /**
    * @returns {string}
    */
  displayFeelsLike(extension)
  {
    return extension.formatTemperature(this.#feelsLikeC);
  }

  /**
    * @returns {string}
    */
  displayHumidity()
  {
    return `${this.#humidityPercent}%`;
  }

  /**
    * @returns {string}
    */
  displayPressure(extension)
  {
    return extension.formatPressure(this.#pressureMBar);
  }

  /**
    * @returns {string}
    */
  displayWind(extension)
  {
    let dir = extension.getWindDirection(this.#windDirDeg);
    return extension.formatWind(this.#windMps, dir);
  }

  /**
    * @returns {string}
    */
  displayGusts(extension)
  {
    return extension.formatWind(this.#gustsMps);
  }

  /**
    * @returns {boolean}
    */
  gustsAvailable()
  {
    return typeof this.#gustsMps === "number";
  }

  /**
    * @returns {string}
    */
  displaySunrise(extension)
  {
    return extension.formatTime(this.#sunrise);
  }

  /**
    * @returns {Date}
    */
  getSunriseDate()
  {
    return this.#sunrise;
  }

  /**
    * @returns {string}
    */
  displaySunset(extension)
  {
    return extension.formatTime(this.#sunset);
  }

  /**
    * @returns {Date}
    */
  getSunsetDate()
  {
    return this.#sunset;
  }

  hasForecast()
  {
    return this.#forecasts !== null;
  }

  forecastDayCount()
  {
    return this.#forecasts.length;
  }

  forecastHourCount(dayIndex)
  {
    return this.#forecasts[dayIndex].length;
  }

  forecastDayHour(dayIndex, hourIndex)
  {
    return this.#forecasts[dayIndex][hourIndex];
  }

  forecastAtHour(dayIndex, hoursFromNow)
  {
    let day = this.#forecasts[dayIndex];
    return day[hoursFromNow / day[0].getDurationHours()];
  }

  forecastHoursFromNow(hoursFromNow)
  {
    let future = new Date().getTime() + 3600000 * hoursFromNow;
    let days = this.#forecasts.length;
    for(let i = 0; i < days; i++)
    {
      let d = this.#forecasts[i];
      let h = d[d.length - 1];
      let endTime = h.getEnd().getTime();

      if(future > endTime) continue;

      let distanceHrs = (future - d[0].getStart().getTime()) / 3600000;
      let index = Math.floor(distanceHrs / h.getDurationHours());
      return this.#forecasts[i][index];
    }

    let lastDay = this.#forecasts[days - 1];
    return lastDay[lastDay.length - 1];
  }

}

export class Forecast
{
  #start;
  #end;
  #weather;

  /**
    * @param {Date} start 
    * @param {Date} end 
    * @param {Weather} weather 
    */
  constructor(start, end, weather)
  {
    this.#start = start;
    this.#end = end;
    this.#weather = weather;
  }

  getStart()
  {
    return this.#start;
  }

  getEnd()
  {
    return this.#end;
  }

  getDurationHours()
  {
    return (this.#end - this.#start) / 3600000;
  }

  displayTime(extension)
  {
    return extension.formatTime(this.#start);
  }

  weather()
  {
    return this.#weather;
  }
}

async function loadJsonAsync(url, params)
{
  return new Promise((resolve, reject) =>
  {
    let httpSession = getSoupSession();
    let paramsHash = Soup.form_encode_hash(params);
    let message = Soup.Message.new_from_encoded_form("GET", url, paramsHash);

    httpSession.send_and_read_async(
      message,
      GLib.PRIORITY_DEFAULT,
      null,
      (sess, result) =>
      {
        let bytes = sess.send_and_read_finish(result);

        let jsonString = bytes.get_data();
        if (jsonString instanceof Uint8Array)
        {
          jsonString = new TextDecoder().decode(jsonString);
        }

        try
        {
          if (!jsonString)
          {
            reject("No data in response body.");
          }
          resolve([message.status_code, JSON.parse(jsonString)]);
        }
        catch(e)
        {
          sess.abort();
          reject(e);
        }
      }
    );
  });
}

function isSuccess(httpStatusCode)
{
  return httpStatusCode >= 200 && httpStatusCode < 300;
}

function clamp(lo, x, hi)
{
  return Math.min(Math.max(lo, x), hi);
}

function getCondit(extension, code, condition, gettext)
{
  if(!extension._translate_condition || extension._providerTranslations || !gettext)
  {
    return condition;
  }
  else
  {
    return gettextCondition(extension.settings.get_enum("weather-provider"), code, gettext);
  }
}

/**
  * @returns {Promise<Weather | null>}
  */
export async function getWeatherInfo(extension, gettext)
{
  const settings = extension.settings;

  let location = await extension._city.getCoords(settings);
  let lat = String(location[0]);
  let lon = String(location[1]);

  let params;
  switch(settings.get_enum("weather-provider"))
  {
    case WeatherProvider.DEFAULT:
    case WeatherProvider.OPENWEATHERMAP:
      {
        params =
        {
          lat,
          lon,
          units: "metric"
        };
        if(extension._providerTranslations) params.lang = extension.locale;
        let apiKey = extension.getWeatherKey();
        if(apiKey) params.appid = apiKey;

        let response;
        let forecastResponse;
        try
        {
          let cur = loadJsonAsync("https://api.openweathermap.org/data/2.5/weather", params);
          let fore = loadJsonAsync("https://api.openweathermap.org/data/2.5/forecast", params);
          let allResp = await Promise.all([ cur, fore ]);
          response = allResp[0];
          forecastResponse = allResp[1];
        }
        catch(e)
        {
          console.error(`OpenWeather Refined: Failed to fetch weather from OpenWeatherMap ('${e.message}').`);
          return null;
        }

        if(!isSuccess(response[0]) || !isSuccess(forecastResponse[0]))
        {
          console.error(`OpenWeather Refined: Invalid API Response from OpenWeatherMap ` +
            `${response[0]}/${forecastResponse[0]}: '${response[1]?.message}'` +
            `/'${forecastResponse[1]?.message}'.`);
          return null;
        }

        let json = response[1];
        let m = json.main;
        let iconId = json.weather[0].icon;

        let sunrise = new Date(json.sys.sunrise * 1000);
        let sunset = new Date(json.sys.sunset * 1000);

        let forecastDays = clamp(1, extension._days_forecast + 1, 5);

        let forecasts = [ ];
        for(let i = 0; i < forecastDays; i++)
        {
          let day = [ ];
          for(let j = 0; j < 8; j++)
          {
            let h = forecastResponse[1].list[i * 8 + j];
            let fIconId = h.weather[0].icon;
            let isFNight = fIconId[fIconId.length - 1] === "n";

            // Create Date from UTC timestamp
            let match = h.dt_txt.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):/);
            let dt = new Date(Date.UTC(match[1], match[2] - 1, match[3], match[4]));

            day.push(new Forecast(
              dt,
              new Date(dt.getTime() + 3600000 * 3),
              new Weather(
                h.main.temp,
                h.main.feels_like,
                h.main.humidity,
                h.main.pressure,
                h.wind?.speed,
                h.wind?.deg,
                h.wind?.gust,
                getIconName(WeatherProvider.OPENWEATHERMAP, fIconId, isFNight, true),
                getCondit(extension, h.weather[0].id, h.weather[0].condition, gettext),
                sunrise,
                sunset
              )
            ));
          }
          forecasts.push(day);
        }

        return new Weather(
          m.temp,
          m.feels_like,
          m.humidity,
          m.pressure,
          json.wind?.speed,
          json.wind?.deg,
          json.wind?.gust,
          getIconName(WeatherProvider.OPENWEATHERMAP, iconId, iconId[iconId.length - 1] === "n", true),
          getCondit(extension, json.weather[0].id, json.weather[0].condition, gettext),
          new Date(json.sys.sunrise * 1000),
          new Date(json.sys.sunset * 1000),
          forecasts
        );
      }

    case WeatherProvider.WEATHERAPICOM:
      {
        params =
        {
          q: `${lat},${lon}`,
          days: String(extension._days_forecast + 1)
        };
        if(extension._providerTranslations) params.lang = extension.locale;
        let apiKey = extension.getWeatherKey();
        if(apiKey) params.key = apiKey;

        let response;
        try
        {
          response = await loadJsonAsync("https://api.weatherapi.com/v1/forecast.json", params);
        }
        catch(e)
        {
          console.error(`OpenWeather Refined: Failed to fetch weather from weatherapi.com ('${e.message}').`);
          return null;
        }

        let statusCode = response[0];
        let json = response[1];
        if(!isSuccess(statusCode))
        {
          let f;
          if(json && json.error) f = json.error.message;
          else f = `Status Code ${statusCode}`;
          console.error(`OpenWeather Refined: Invalid API Response from weatherapi.com '${f}'.`);
          return null;
        }

        let m = json.current;
        let astro;
        try
        {
          astro = json.forecast.forecastday[0].astro;
        }
        catch(e)
        {
          console.log(m);
          console.log(json.forecast);
          console.log(json.forecast.forecastday);
          throw e;
        }

        const KPH_TO_MPS = 1.0 / 3.6;
        // We only care about the time, so put in a random day
        let sunrise = new Date(`2000/01/01 ${astro.sunrise}`);
        let sunset = new Date(`2000/01/01 ${astro.sunset}`);

        let gotDaysForecast = json.forecast.forecastday.length;
        let forecastDays = clamp(1, extension._days_forecast + 1, gotDaysForecast);

        let forecasts = [ ];
        for(let i = 0; i < forecastDays; i++)
        {
          let day = [ ];
          let d = json.forecast.forecastday[i];
          for(let j = 0; j < d.hour.length; j++)
          {
            let h = d.hour[j];
            let dt = new Date(h.time);
            day.push(new Forecast(
              dt,
              new Date(dt.getTime() + 3600000),
              new Weather(
                h.temp_c,
                h.feelslike_c,
                h.humidity,
                h.pressure_mb,
                h.wind_kph * KPH_TO_MPS,
                h.wind_degree,
                h.gust_kph * KPH_TO_MPS,
                getIconName(WeatherProvider.WEATHERAPICOM, h.condition.code, !h.is_day, true),
                getCondit(extension, h.condition.code, h.condition.text, gettext),
                sunrise,
                sunset
              )
            ));
          }
          forecasts.push(day);
        }

        return new Weather(
          m.temp_c,
          m.feelslike_c,
          m.humidity,
          m.pressure_mb,
          m.wind_kph * KPH_TO_MPS,
          m.wind_degree,
          m.gust_kph * KPH_TO_MPS,
          getIconName(WeatherProvider.WEATHERAPICOM, m.condition.code, !m.is_day, true),
          getCondit(extension, m.condition.code, m.condition.text, gettext),
          sunrise,
          sunset,
          forecasts
        );
      }

    default:
      console.error("OpenWeather Refined: Invalid weather provider.");
      return null;
  }
}

