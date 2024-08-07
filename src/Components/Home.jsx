import React, { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const apiKey = "f66d9727501911f62c328508b94c5e3e";

const fetchWeather = async ({ queryKey }) => {
  const [_, city] = queryKey;
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const response = await axios.get(weatherUrl);
  return response.data;
};

const fetchFullMonthForecast = async ({ queryKey }) => {
  const [_, city] = queryKey;
  const forecastUrl = `https://api.mockweather.com/forecast/monthly?q=${city}&appid=${apiKey}&units=metric`;

  const mockData = {
    list: Array.from({ length: 30 }, (_, i) => ({
      dt: Math.floor(Date.now() / 1000) + i * 86400,
      main: {
        temp: Math.random() * 10 + 15,
        temp_min: Math.random() * 5 + 10,
        temp_max: Math.random() * 10 + 20,
        pressure: Math.random() * 20 + 1000,
        humidity: Math.random() * 20 + 60,
      },
      weather: [
        {
          description: "clear sky",
        },
      ],
      sys: {
        sunrise: Math.floor(Date.now() / 1000) + 6 * 3600,
        sunset: Math.floor(Date.now() / 1000) + 18 * 3600,
      },
    })),
  };

  return new Promise((resolve) => setTimeout(() => resolve(mockData), 1000));
};

const Home = () => {
  const [city, setCity] = useState("");
  const [searchCity, setSearchCity] = useState("");

  const { data: weatherData, isLoading: isLoadingWeather } = useQuery({
    queryKey: ["weather", searchCity],
    queryFn: fetchWeather,
    enabled: !!searchCity,
  });

  const { data: forecastData, isLoading: isLoadingForecast } = useQuery({
    queryKey: ["forecast", searchCity],
    queryFn: fetchFullMonthForecast,
    enabled: !!searchCity,
  });

  const handleSearch = () => {
    setSearchCity(city);
  };

  const groupForecastByDay = (list) => {
    const grouped = {};
    list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    return grouped;
  };

  const forecastByDay = forecastData
    ? groupForecastByDay(forecastData.list)
    : {};

  const getDailySummary = (forecasts) => {
    const temperatures = forecasts.map((forecast) => forecast.main.temp);
    const descriptions = forecasts.map(
      (forecast) => forecast.weather[0].description
    );
    const avgTemp = (
      temperatures.reduce((acc, temp) => acc + temp, 0) / temperatures.length
    ).toFixed(2);
    const mostCommonDescription = descriptions
      .sort(
        (a, b) =>
          descriptions.filter((v) => v === a).length -
          descriptions.filter((v) => v === b).length
      )
      .pop();
    const minTemp = Math.min(
      ...forecasts.map((forecast) => forecast.main.temp_min)
    );
    const maxTemp = Math.max(
      ...forecasts.map((forecast) => forecast.main.temp_max)
    );
    const avgPressure = (
      forecasts.reduce((acc, forecast) => acc + forecast.main.pressure, 0) /
      forecasts.length
    ).toFixed(2);
    const avgHumidity = (
      forecasts.reduce((acc, forecast) => acc + forecast.main.humidity, 0) /
      forecasts.length
    ).toFixed(2);
    const sunrise = new Date(
      forecasts[0].sys.sunrise * 1000
    ).toLocaleTimeString();
    const sunset = new Date(
      forecasts[0].sys.sunset * 1000
    ).toLocaleTimeString();
    const country = "Mock Country";
    return {
      avgTemp,
      mostCommonDescription,
      minTemp,
      maxTemp,
      avgPressure,
      avgHumidity,
      sunrise,
      sunset,
      country,
    };
  };

  const currentWeatherDate = weatherData
    ? new Date(weatherData.dt * 1000).toLocaleDateString()
    : "";

  const rowData = Object.entries(forecastByDay)
    .filter(([date]) => date !== currentWeatherDate)
    .map(([date, forecasts]) => {
      const {
        avgTemp,
        mostCommonDescription,
        minTemp,
        maxTemp,
        avgPressure,
        avgHumidity,
        sunrise,
        sunset,
        country,
      } = getDailySummary(forecasts);
      return {
        date,
        avgTemp,
        mostCommonDescription,
        minTemp: minTemp.toFixed(2),
        maxTemp: maxTemp.toFixed(2),
        avgPressure,
        avgHumidity,
        sunrise,
        sunset,
        country,
      };
    });

  const columns = [
    { headerName: "Date", field: "date" },
    { headerName: "Average Temp (°C)", field: "avgTemp" },
    { headerName: "Min Temp (°C)", field: "minTemp" },
    { headerName: "Max Temp (°C)", field: "maxTemp" },
    { headerName: "Weather", field: "mostCommonDescription" },
    { headerName: "Pressure (hPa)", field: "avgPressure" },
    { headerName: "Humidity (%)", field: "avgHumidity" },
    { headerName: "Sunrise", field: "sunrise" },
    { headerName: "Sunset", field: "sunset" },
    { headerName: "Country", field: "country" },
  ];

  return (
    <div>
      <div className="container-fluid" id="bgImage">
        <h2 className="text-center" style={{ color: "#87ceeb" }}>
          <img src="/Logo.png" alt="" style={{ height: "100px" }} />
          Weather Report
        </h2>
        <div className="d-flex justify-content-center align-item-center">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city or state"
            className="form-control d-flex justify-content-center align-item-center w-75"
            id="inputStyl"
          />
          <button onClick={handleSearch} className="btn btn-primary" id="btn1">
            Search
          </button>
        </div>
      </div>
      {isLoadingWeather ? (
        <p className="text-center">Loading...</p>
      ) : (
        weatherData && (
          <div className="container-fluid" id="cont1">
            <div className="container">
              <div className="row">
                <h4 className="col-12 text-center" id="headerT">
                  Current Weather on {currentWeatherDate}
                </h4>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Description</h5>
                    <p className="card-text">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Temperature</h5>
                    <p className="card-text">{weatherData.main.temp} °C</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Max Temperature</h5>
                    <p className="card-text">{weatherData.main.temp_max} °C</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Min Temperature</h5>
                    <p className="card-text">{weatherData.main.temp_min} °C</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Humidity</h5>
                    <p className="card-text">{weatherData.main.humidity}%</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Sunrise</h5>
                    <p className="card-text">
                      {new Date(
                        weatherData.sys.sunrise * 1000
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Sunset</h5>
                    <p className="card-text">
                      {new Date(
                        weatherData.sys.sunset * 1000
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Country</h5>
                    <p className="card-text">{weatherData.sys.country}</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="card-body">
                    <h5 className="card-title" id="headerT">Pressure</h5>
                    <p className="card-text">{weatherData.main.pressure} hPa</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
      {isLoadingForecast ? (
        <p className="text-center">Loading...</p>
      ) : (
        forecastData && (
          <div className="container-fluid" id="cont1">
            <div className="container">
              <h4 className="text-center" id="headerT">Monthly Forecast</h4>
              <div
                className="ag-theme-alpine"
                id="ag-grid-id"
                style={{ height: 269, width: "100%" }}
              >
                <AgGridReact
                  rowData={rowData}
                  columnDefs={columns}
                  defaultColDef={{
                    sortable: true,
                    filter: true,
                    resizable: true,
                  }}
                ></AgGridReact>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Home;
