
const express = require("express");
const fs = require("fs");
const { setInterval } = require("timers");

const recordRoutes = express.Router();

const apiKey = 'w1EFqPBDvJ73bhIg9sWzQBFHv4d7rij0';
const apiUrlBase = 'https://api.polygon.io/v2/aggs/ticker';

let stocksData = [];

// Function to generate a unique random refresh interval
function generateRandomRefreshInterval() {
  const usedIntervals = new Set();
  return () => {
    let randomInterval;
    do {
      randomInterval = Math.floor(Math.random() * 20) + 1;
    } while (usedIntervals.has(randomInterval));
    usedIntervals.add(randomInterval);
    return randomInterval;
  };
}

const getRandomRefreshInterval = generateRandomRefreshInterval();

// Function to fetch stock data from Polygon API
async function fetchStockData(symbol) {
  const endDate = "2023-01-09";
  const startDateString = "2023-01-09";
  const apiUrl = `${apiUrlBase}/${symbol}/range/1/day/${startDateString}/${endDate}?apiKey=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}. Status: ${response.status}`);
    }

    const responseData = await response.json();
    const latestPrice = responseData.results[0].c;
    const op = responseData.results[0].o;

    const randomRefreshInterval = getRandomRefreshInterval();

    console.log("lastUpdatedTime", Math.floor(new Date().getTime() / 1000) % 60);
    return {
      symbol,
      open: op,
      refreshInterval: randomRefreshInterval,
      price: latestPrice,
      lastUpdateTime: Math.floor(new Date().getTime() / 1000) % 60
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}: ${error.message}`);
    return null;
  }
}

// Function to periodically update stock prices
function updateStockPrices() {
  setInterval(async () => {
    const currentTime = Math.floor(new Date().getTime() / 1000) % 60;
    for (const stock of stocksData) {
      console.log(stock, currentTime, stock.lastUpdateTime, stock.refreshInterval);
      const totalTime = (stock.lastUpdateTime + stock.refreshInterval) % 60;
      if (currentTime === totalTime) {
        console.log("entered");
        const updatedStock = await fetchStockData(stock.symbol);
        if (updatedStock) {
          stock.price = updatedStock.price;
          stock.lastUpdateTime = updatedStock.lastUpdateTime;
          console.log(`Updated ${stock.symbol} price: ${stock.price}`);
        }
      }
    }
  }, 1000); // Update every second (adjust as needed)
}

// Initialize stock data
async function initializeStockData() {
  const stockSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "AAAU", "ABNB", "ACN", "CSCO", "ORCL", "SAP", "ACN", "CRM", "ADBE", "CGEMY", "SHOP", "TEAM", "SNPS", "ZM", "UBER"];
  for (const symbol of stockSymbols) {
    const stockData = await fetchStockData(symbol);
    if (stockData) {
      stocksData.push(stockData);
    }
  }

  // Save initial stock data to a file
  fs.writeFileSync('stocks.json', JSON.stringify(stocksData), 'utf-8');
}

// Fetch initial stock data and start updating prices
initializeStockData();
updateStockPrices();

// Expose API to fetch stock prices
recordRoutes.route("/record").get((req, res) => {
  res.json(stocksData);
});

module.exports = recordRoutes;

/*
const express = require("express");
const fs = require("fs");
const { setInterval } = require("timers");

const recordRoutes = express.Router();

const apiKey = 'w1EFqPBDvJ73bhIg9sWzQBFHv4d7rij0';
const apiUrlBase = 'https://api.polygon.io/v2/aggs/ticker';

let stocksData = [];

// Function to generate a unique random refresh interval
function generateRandomRefreshInterval() {
    const usedIntervals = new Set();
    return () => {
      let randomInterval;
      do {
        randomInterval = Math.floor(Math.random() * 20) + 1;
      } while (usedIntervals.has(randomInterval));
      usedIntervals.add(randomInterval);
      return randomInterval;
    };
  }

  
    const getRandomRefreshInterval = generateRandomRefreshInterval();

// Function to fetch stock data from Polygon API
async function fetchStockData(symbol) {
  const endDate = new Date().toISOString().split('T')[0]; // Today's date
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1); // One day ago
  const startDateString = startDate.toISOString().split('T')[0];

  const apiUrl = `${apiUrlBase}/${symbol}/range/1/day/${startDateString}/${endDate}?apiKey=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${symbol}. Status: ${response.status}`);
    }

    const responseData = await response.json();
    const latestPrice = responseData.results[0].c;
    const op = responseData.results[0].o;

    return {
      symbol,
      open: op,
      refreshInterval: getRandomRefreshInterval,
      price: latestPrice,
      lastUpdateTime: Math.floor(new Date().getTime() / 1000) % 60,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}: ${error.message}`);
    return null;
  }
}

// Function to periodically update stock prices
function updateStockPrices() {
  setInterval(async () => {
    const currentTime = Math.floor(new Date().getTime() / 1000) % 60;
    for (const stock of stocksData) {
        const totalTime = (stock.lastUpdateTime + stock.refreshInterval) % 60;
      if (currentTime === totalTime) {
        const updatedStock = await fetchStockData(stock.symbol);
        if (updatedStock) {
          stock.price = updatedStock.price;
          stock.lastUpdateTime = updatedStock.lastUpdateTime;
          console.log(`Updated ${stock.symbol} price: ${stock.price}`);
        }
      }
      //}
    }
  }, 1000); // Check every second
}

// Initialize stock data
async function initializeStockData() {
    const stockSymbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "AAAU", "ABNB", "ACN", "CSCO", "ORCL", "SAP", "ACN", "CRM", "ADBE", "CGEMY", "SHOP", "TEAM", "SNPS", "ZM", "UBER"];
    for (const symbol of stockSymbols) {
    const stockData = await fetchStockData(symbol);
    if (stockData) {
      stocksData.push(stockData);
    }
  }

  // Save initial stock data to a file
  fs.writeFileSync('stocks.json', JSON.stringify(stocksData), 'utf-8');
}

// Fetch initial stock data and start updating prices
initializeStockData();
updateStockPrices();

// Expose API to fetch stock prices
recordRoutes.route("/record").get((req, res) => {
  res.json(stocksData);
});

module.exports = recordRoutes;
*/
