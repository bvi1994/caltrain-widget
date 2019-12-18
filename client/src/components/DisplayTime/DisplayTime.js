import React, {Component} from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import './styles.css'

class DisplayTime extends Component {

  determineService = (trainNumber) => {
    const beginningDigit = Math.floor(trainNumber / 100);
    if(beginningDigit === 1 || beginningDigit === 4){
      return 'local'
    }
    if(beginningDigit === 3 || beginningDigit === 8){
      return 'bullet'
    }
    if(beginningDigit === 2){
      return 'limited'
    }
    return 'special'
  }

  render() {
    const {stopTimetable, reference, asNavFor} = this.props;
    const settings  = {
      ref: reference,
      asNavFor: asNavFor,
      infinite: false,
    }
    return (
      <Slider
        {...settings}
      >
      {stopTimetable.map(time =>
        <div
          className={`time ${this.determineService(time.trainNumber)}`}
          key={time.trainNumber}
        >
          {time.arriveTime || time.departTime}
        </div>
      )}
      </Slider>
    )
  }
}

export default DisplayTime;
