import React, {Component} from 'react';
import Select from 'react-select';

class DropdownStation extends Component {
  render(){
    const {stationList, originOrDestination, changeStation} = this.props;
    return (
      <Select
        options={stationList}
        onChange={changeStation}
      />
    )
  }
}

export default DropdownStation;
