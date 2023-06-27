const express = require('express');
const cors = require('cors');
const axios = require('axios')
const fs = require('fs');
const AdmZip = require('adm-zip');
const JSZip = require('jszip');
const xml2js = require('xml2js');

require('dotenv').config();
const { PORT, REACT_APP_DART_API_KEY, REACT_APP_PUBLIC_DATA_API_KEY } = process.env;


const app = express();
app.use(cors());

app.get('/api/go-data/:stockCode/:date', async (req, res) => {
    console.log("go--   data")
  try {
    const { stockCode, date } = req.params;
    const apiKey = REACT_APP_PUBLIC_DATA_API_KEY;
    const url = `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${apiKey}&numOfRows=1&pageNo=1&resultType=json&basDt=${date}&likeSrtnCd=${stockCode}`;
    const apiResponse = await axios.get(url);
    
    res.json(apiResponse.data)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stock data.' });
  }
});
//한번에 여러개 요청
app.get('/api/go-data-all/:stockCode/:date', async (req, res) => {
    console.log("go--data--all")
  try {
    const { stockCode } = req.params;
    const dates = req.query.dates.split(',');
    const apiKey = REACT_APP_PUBLIC_DATA_API_KEY;
    let results = [];
    for (const date of dates){
      const url = `https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo?serviceKey=${apiKey}&numOfRows=1&pageNo=1&resultType=json&basDt=${date}&likeSrtnCd=${stockCode}`;
      const apiResponse = await axios.get(url);
      results.push(apiResponse.data);
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stock data.' });
  }
});

app.get('/api/open-dart/:corpCode', async (req, res) => {
    console.log("dart opem")
    try {
      const { corpCode } = req.params;
      const apiKey = process.env.REACT_APP_DART_API_KEY;
      const url = `https://opendart.fss.or.kr/api/company.json?crtfc_key=${apiKey}&corp_code=${corpCode}`;
  
      const apiResponse = await axios.get(url);
      res.json(apiResponse.data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching company data.' });
    }
  });

  app.get('/api/holidays/:year', async (req, res) => {
    try {
      const { year } = req.params;
      const apiKey = REACT_APP_PUBLIC_DATA_API_KEY;
      const url = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo?solYear=${year}&ServiceKey=${apiKey}`;
  
      const apiResponse = await axios.get(url);
      res.json(apiResponse.data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error fetching holiday data.' });
    }
  });

  app.get('/api/download-zip', async (req, res) => {
    try {
      const apiKey = process.env.REACT_APP_PUBLIC_DATA_API_KEY;
      const url = `https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=${apiKey}`;
  
      const response = await axios.get(url, { responseType: 'arraybuffer',
      });
      console.log('response.data:', response.data);
      const xmlData = response.data;
  
      const parser = new xml2js.Parser();
      parser.parseString(xmlData, (err, parsedXML) => {
        if (err) {
          res.status(500).json({ message: 'Error parsing XML data.' });
        } else {
          res.json(parsedXML);
        }
      });
    } catch (err) {
      
      res.status(500).json({ message: 'Error fetching and processing zip data.' });
    }
  });


app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
