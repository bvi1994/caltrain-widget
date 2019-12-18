const mongoose = require('mongoose');
const axios = require('axios');
const lodash = require('lodash');
const constants = require("./../Server.constants");

const main = async () => {
  mongoose.connect(constants.MONGODBADDRESS, { useNewUrlParser: true });
  let db = mongoose.connection;
  db.once('open', () => console.log('connected to the database'));
  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
  const stationList = await getStationsList();
  for(let i = 0; i < stationList.length; i++){
    sendStationList(stationList[i]);
  }
  console.log('Station info list added to database');
}

const getStationsList = async () => {
  let response;
  try {
    response = await axios(`${constants.STATIONNAMES}`)
  } catch (error) {
    console.log('Unable to get the list of stations from the API')
    console.log('Error: ', error)
  }
  let data = JSON.parse(response.data.trim());
  data = data.Contents.dataObjects.ScheduledStopPoint
  lodash.remove(data, {Name: 'San Jose Caltrain Station'});
  lodash.remove(data, {Name: 'Tamien Caltrain Station'});
  data.sort((a,b) => {
    return a.id - b.id
  })
  console.log(data);
  return data;
}

const sendStationList = (station) => {
  console.log('sending station list...')
  const StationSchema = new mongoose.Schema({
    station: mongoose.Schema.Types.Mixed
  });
  let StationInfo;
  try {
    StationInfo = mongoose.model('station-info')
  } catch(error) {
    StationInfo = mongoose.model('station-info', StationSchema)
  }
  const newStation = new StationInfo({
    station : station
  });
  try {
    newStation.save()
  } catch (error) {
    console.log('unable to add station to database');
    console.log(`Database error ${error}`)
  }
}

main();
