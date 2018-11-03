import React, { Component } from 'react';
import './App.css';
import { createStore, combineReducers } from 'redux';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as SdkMapActions from '@boundlessgeo/sdk/actions/map';

const store = createStore(combineReducers({
  'map': SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

class App extends Component {
  componentDidMount() {
    //set map center
    store.dispatch(SdkMapActions.setView([-90.2, 38.6], 9));

  // add the OSM source
  store.dispatch(SdkMapActions.addOsmSource('osm'));

  // add an OSM layer
  store.dispatch(SdkMapActions.addLayer({
    id: 'osm',
    source: 'osm',
  }));
  this.addLayerFromGeoJSON('https://raw.githubusercontent.com/OpenDataSTL/arch2park/master/Landmarks.geojson', 'landmark');
}
addLayerFromGeoJSON(url, sourceName) {
    // Fetch URL
    fetch(url)
      .then(
        response => response.json(),
        error => console.error('An error occured.', error),
      )
      // addFeatures with the features, source name
      .then((json) => {
        // store.dispatch(SdkMapActions.addFeatures(sourceName, json));
        store.dispatch(SdkMapActions.addSource(sourceName, {
          type: 'geojson',
          data: json
        }));
        store.dispatch(SdkMapActions.addLayer({
          id: `${sourceName}-layer`,
          source: sourceName,
          type: 'circle',
          paint: {
            'circle-radius': 3,
            'circle-color': '#feb24c',
            'circle-stroke-color': '#f03b20',
          },

        }));
      })
      .catch((exception) => {
        console.error('An error occurred.', exception);
      });
  };

  // This is called by the onClick, keeping the onClick HTML clean
  runFetchGeoJSON() {
    const url = 'https://raw.githubusercontent.com/OpenDataSTL/arch2park/master/Landmarks.geojson';
    this.addLayerFromGeoJSON(url, 'dynamic');
  };
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Smart Cities Map
          </a>
        </header>
        <SdkMap store={store} />
      </div>
    );
  }
}

export default App;
