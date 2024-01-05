const express = require("express");
const fs = require("fs");

const app = express();
const cors = require("cors");
//require("dotenv").config({path:"./config.env"});
const port = process.env.port || 5000;

app.use(cors());
app.use(express.json());
app.use(require("./routes/record"));

//get Driver connection
//const connectToDatabase = require("./db/conn");
app.get("/api/stocks", (req, res) => {
    try {
      // Read stock data from the file
      const stocksData = JSON.parse(fs.readFileSync('stocks.json', 'utf-8'));
      res.json(stocksData);
    } catch (error) {
      console.error('Error reading stocks data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
app.listen(port,() => {
    console.log(`server is running on port: ${port}`);

});