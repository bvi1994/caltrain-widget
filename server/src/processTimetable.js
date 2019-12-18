const mongoose = require('mongoose');
const axios = require('axios');
const lodash = require('lodash');
const csvtojson = require('csvtojson')
const constants = require("./../Server.constants");

mongoose.connect(constants.MONGODBADDRESS, { useNewUrlParser: true });

let db = mongoose.connection;
db.once('open', () => console.log('connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const main = async () => {
  const weekday = await seedTimetableDatabaseWeekday();
  const weekend = await seedTimetableDatabaseWeekend();
  for(let station in weekday){
    await sendtoDatabase(weekday[station], 'weekday')
  }
  for(let station in weekend){
    await sendtoDatabase(weekend[station], 'weekend')
  }
}

const seedTimetableDatabaseWeekday = async () => {
  const weekdayTimetable = await csvtojson().fromFile('./../weekday_schedule.csv');
  let stoptimetable = {};
  for(let i = 0; i < weekdayTimetable.length; i++){
    const info = {
      arriveTime: weekdayTimetable[i].departure_time,
      trainNumber: weekdayTimetable[i].trip_id,
      scheduledTime: true,
      realTime: false
    }
    if(!stoptimetable[weekdayTimetable[i].stop_id]){
      stoptimetable[weekdayTimetable[i].stop_id] = [];
    }
    stoptimetable[weekdayTimetable[i].stop_id].push(info);
  }
  return stoptimetable;
}

const seedTimetableDatabaseWeekend = async () => {
  const weekendTimetable = await csvtojson().fromFile('./../weekend_schedule.csv');
  let stoptimetable = {};
  for(let i = 0; i < weekendTimetable.length; i++){
    const info = {
      arriveTime: weekendTimetable[i].departure_time,
      trainNumber: weekendTimetable[i].trip_id,
      scheduledTime: true,
      realTime: false
    }
    if(!stoptimetable[weekendTimetable[i].stop_id]){
      stoptimetable[weekendTimetable[i].stop_id] = [];
    }
    stoptimetable[weekendTimetable[i].stop_id].push(info);
  }
  return stoptimetable;
}

const sendtoDatabase = async (scheduledStops, serviceDay) => {
  const TimeSchema = new mongoose.Schema({
    station_id: mongoose.Schema.Types.Mixed
  })
  let Info;
  try {
    Info = mongoose.model(`${serviceDay}-schedule`)
  } catch(error) {
    Info = mongoose.model(`${serviceDay}-schedule`, TimeSchema)
  }
  const newStation = new Info({
    station_id : scheduledStops
  });
  try {
    newStation.save()
  } catch (error) {
    console.log('unable to add station to database');
    console.log(`Database error ${error}`)
  }
}

main()
