import React, {Component} from 'react';
import './App.css'
import Main from './components/Main'
import FAQComponent from './components/FAQComponent/ComponentFAQ'

class App extends Component {

  render() {
    return (
      <div>
        <div className="App">
          <Main />
        </div>
        <center className="Disclaimer">
          This application is NOT run by Caltrain or any of its affliates or contractors. Created by <a href={`https://www.linkedin.com/in/bvi1994/}`}>Brandon Vi</a> Help me improve the application by getting the <a href={`https://github.com/bvi1994/caltrain-widget`}>source code</a>
          <FAQComponent />
        </center>
      </div>
    );
  }
}

export default App;
