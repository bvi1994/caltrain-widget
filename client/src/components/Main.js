import React, {Component} from 'react';
import axios from 'axios';

import DropdownStation from './DropdownMenu/DropdownStation'
import DisplayTime from './DisplayTime/DisplayTime';

import './styles.css'

class Main extends Component {

  constructor(props){
    super(props);
    this.state = {
      originStation: '',
      originStationsInfo: [],
      originStationId: '',
      destinationStation: '',
      destinationStationsInfo: [],
      destinationStationId: '',
      stationsList: [],
      stationsData: [],
      originTimes: [],
      destinationTimes: [],
      matchedTrips: [],
      originStationSliderRef: null,
      destinationSliderRef: null,
      // We need the SliderRef to keep the two slider times in sync. See
      // https://react-slick.neostack.com/docs/example/as-nav-for
      currentDay: new Date().getDay(),
    }
  }

  async componentDidMount() {
    await this.getStationsData();
    await this.getListOfStations();
    await this.setState({
      originStationSliderRef: this.originSlider,
      destinationSliderRef: this.destinationSlider,
    })
  }

  determineIds = async () => {
    // To do: edge case with Stanford
    const {originStationsInfo, destinationStationsInfo} = this.state;
    originStationsInfo.sort( (a,b) => b.id - a.id)
    destinationStationsInfo.sort( (a,b) => b.id - a.id)
    if(originStationsInfo[0].id > destinationStationsInfo[0].id){
      // Northbound direction, station numbers need to be odd
      await this.setState({
        originStationId: originStationsInfo[1].id,
        destinationStationId: destinationStationsInfo[1].id
      })
      return;
    }
    // Southbound direction, station numbers need to be even
    await this.setState({
      originStationId: originStationsInfo[0].id,
      destinationStationId: destinationStationsInfo[0].id
    })
  }

  getStationInfo = (station) => {
    // Grabs the info for the selected station
    return this.state.stationsData.filter(stops => stops.Name === station.value)
  }


  changeOriginStation = async (originStation) => {
    const originStationsInfo = this.getStationInfo(originStation);
    await this.setState({
      originStation: originStation,
      originStationsInfo: originStationsInfo,
    })
    if(this.state.destinationStation){
      await this.determineIds()
      await this.getTimes()
      await this.matchTrips();
    }
  }

  changeDestinationStation = async (destinationStation) => {
    // Handles changes if the user were to change the desintation station of the application
    const destinationStationsInfo = this.getStationInfo(destinationStation);
    await this.setState({
      destinationStation: destinationStation,
      destinationStationsInfo: destinationStationsInfo,
    })
    if(this.state.originStation){
      await this.determineIds()
      await this.getTimes()
      await this.matchTrips();
    }
  }

  getStationsData = async () => {
    // Makes call to grab the station data such as stop ids for that sation
    console.log(`porty: ${process.env.PORT ||'http://localhost:3002'}`)
    const response = await axios(`https://caltrain-widget.herokuapp.com/getStationsData`);
    const stopsData = response.data.stationData;
    this.setState({
      stationsData: stopsData,
    })
  }

  getListOfStations = async () => {
    // Getting the list of station names for the dropdown menu
    const serviceDay = (this.state.currentDay > 0 && this.state.currentDay < 6) ? 'weekday' : 'weekend';
    const response = await axios(`https://caltrain-widget.herokuapp.com/${serviceDay}/getStationList`);
    const stopsNames = response.data.stationList;
    this.setState({
      stationsList: stopsNames.map((station) => {
        return {value: station, label: `${station} station`}
        // We need the value and label keys as required by the react-select
        // API dropdown menu
      }),
    })
  }

  getTimes = async () => {
    // Make API calls to get the timetables for the selected stations
    const {originStationId, destinationStationId} = this.state;
    const serviceDay = (this.state.currentDay > 0 && this.state.currentDay < 6) ? 'weekday' : 'weekend'
    const responseOrigin = await axios(`${process.env.PORT ||'http://localhost:3002'}/getDepartTimes/${serviceDay}/${originStationId}`)
    const responseDestination = await axios(`${process.env.PORT ||'http://localhost:3002'}/getArriveTimes/${serviceDay}/${destinationStationId}`)
    const originTimeTable = responseOrigin.data.scheduledTimes.map((time) => JSON.stringify(time));
    const departTimeTable = responseDestination.data.scheduledTimes.map((time => JSON.stringify(time)));
    this.setState({
      originTimes: originTimeTable,
      destinationTimes: departTimeTable,
    })
  }

  matchTrips = () => {
    let {originTimes, destinationTimes} = this.state;
    originTimes = originTimes.map(time => JSON.parse(time))
    destinationTimes = destinationTimes.map(time => JSON.parse(time))
    let combinedArray = [];
    for(let i = 0; i < originTimes.length; i++){
      let arrivalTime = destinationTimes.find((trip) => trip.trainNumber === originTimes[i].trainNumber)
      if(!arrivalTime){
        continue;
      }
      const tripInfo = {
        departTime: originTimes[i].arriveTime,
        arriveTime: arrivalTime.arriveTime,
        trainNumber: arrivalTime.trainNumber,
        departRealTime: originTimes[i].realTime,
        arriveRealTime: arrivalTime.realTime,
      }
      combinedArray.push(tripInfo);
    }
    this.setState({
      matchedTrips: combinedArray,
    })
    return combinedArray;
  }

  render() {
    const {stationsList, originStation, matchedTrips} = this.state;
    const arriveTimetable = matchedTrips.map(({arriveTime, ...misc}) => misc);
    const departTimetable = matchedTrips.map(({departTime, ...misc}) => misc);
    return (
      <div className="Main">
        <DropdownStation
          stationList={stationsList}
          originOrDestination={`origin`}
          changeStation={this.changeOriginStation}
        />
        {arriveTimetable &&
          <DisplayTime
            stopTimetable={arriveTimetable}
            asNavFor={this.state.destinationSliderRef}
            reference={slider => (this.originSlider = slider)}
          />
        }
        <DropdownStation
          stationList={stationsList.filter(station => station !== originStation)}
          originOrDestination={`destination`}
          changeStation={this.changeDestinationStation}
        />
        {departTimetable &&
          <DisplayTime
            stopTimetable={departTimetable}
            asNavFor={this.state.originStationSliderRef}
            reference={slider => (this.destinationSlider = slider)}
          />
        }
      </div>
    );
  }
}

export default Main;
