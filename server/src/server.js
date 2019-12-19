const axios = require('axios');
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const mongoose = require('mongoose');
const lodash = require('lodash');
const path = require('path')
const constants = require("./../Server.constants");

mongoose.connect(constants.MONGODBADDRESS || process.env.MONGODBADDRESS, { useNewUrlParser: true });
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// console.log('logging in with: ', process.env.MONGODBADDRESS)

const sortTimeArray = (timeTableArray) => {
  for(let i = 0; i < timeTableArray.length; i++){
    timeTableArray[i].arriveTime = convertFrom24To12Format(timeTableArray[i].arriveTime)
  }
  return timeTableArray.sort(
    (a, b) => new Date(`1970/01/01 ${a.arriveTime}`) - new Date(`1970/01/01 ${b.arriveTime}`)
    // Source: https://stackoverflow.com/a/17064665
  );
}

const convertFrom24To12Format = (time24) => {
  // Source: https://stackoverflow.com/a/58878443
  const [sHours, minutes] = time24.match(/([0-9]{1,2}):([0-9]{2})/).slice(1);
  const period = +sHours < 12 ? 'AM' : 'PM';
  const hours = +sHours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

const combineArray = (scheduledTime, realTime) => {
  let combinedArray = [];
  while(realTime.length && scheduledTime.length){
    if(realTime[0].trainNumber === schedule[0].trainNumber){
      combinedArray.push(realTime.shift());
      scheduledTime.shift(); // Removing the schedule time since we already have the real time for that trip
      continue;
    }
    combinedArray.push(scheduledTime.shift());
  }
  combinedArray = [...combinedArray, scheduledTime]
  return combinedArray;
}

app.get("/getArriveTimes/:day/:stationId", async (req, res) => {
  const {stationId, day} = req.params;
  // console.log('stationId: ', stationId);
  await db.collection(`${day}-schedules`).find({
    stationInfo: {$exists: true}
  }).toArray((error, result) =>{
    if(error) {
      console.log('Schedule Database Error: ', error)
    }
    let scheduledTimes;
    for(let i = 0; i < result.length; i++){
      if(result[i].stationInfo[stationId]){
        scheduledTimes = result[i].stationInfo[stationId]
        break;
      }
    }
    scheduledTimes = sortTimeArray(scheduledTimes);
    res.send({
      scheduledTimes: scheduledTimes,
      success: true,
    })
  })
})

app.get("/getDepartTimes/:day/:stationId", async (req, res) => {
  const {stationId, day} = req.params;
  // console.log('stationId: ', stationId);
  await db.collection(`${day}-schedules`).find({
    stationInfo: {$exists: true}
  }).toArray((error, result) =>{
    if(error) {
      console.log('Schedule Database Error: ', error)
    }
    let scheduledTimes;
    for(let i = 0; i < result.length; i++){
      if(result[i].stationInfo[stationId]){
        scheduledTimes = result[i].stationInfo[stationId]
        break;
      }
    }
    scheduledTimes = sortTimeArray(scheduledTimes);
    res.send({
      scheduledTimes: scheduledTimes,
      success: true,
    })
  })
})
//
// app.get("/getRealTimes", (req, res) => {
//
// })

app.get("/getStationsData", async (req, res) => {
  await db.collection('station-infos').find().toArray((error, result) => {
    if(error) {
      console.log(`Error has occurred in /getStationsData: ${error}`)
    }
    result = lodash.map(result, 'station');
    res.json({
      stationData: result,
      success: true,
    })
  });
})

app.get("/:day/getStationList", async (req, res) => {
  const {day} = req.params;
  await db.collection('station-infos').find().toArray((error, result) => {
    if(error) {
      console.log(`Error has occurred in /getStationList: ${error}`)
    }
    result = lodash.map(result, 'station');
    result = lodash.uniqBy(result, 'Name');
    result = lodash.map(result, 'Name');
    if(day === 'weekend'){
      result.splice(-6);
    }
    if(day === 'weekday'){
      result.splice(result.indexOf('Broadway Caltrain'), 1);
      result.splice(result.indexOf('Atherton Caltrain'), 1);
    }
    res.json({
      stationList: result,
      success: true,
    })
  });
})

app.listen(process.env.PORT || 3002, () => {
  console.log("server ready");
});

if(process.env.NODE_ENV === 'production'){
  // app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}
