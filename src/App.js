import React, { Component } from 'react';
import './App.css';
import { createStore, combineReducers } from 'redux';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as SdkMapActions from '@boundlessgeo/sdk/actions/map';
import SdkPopup from '@boundlessgeo/sdk/components/map/popup';

const store = createStore(combineReducers({
  'map': SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());


/** A popup
 */
class FeaturePopup extends SdkPopup {
  buildAttributes(feature) {
    const keys = Object.keys(feature.properties);
    const attributeList = [];
    for(let i=0; i<= keys.length; i++){
      if(feature.properties[keys[i]]){
        attributeList.push(<li className='label'>{keys[i]} : {feature.properties[keys[i]]}</li>);
      }
    }
    return (<ul>{attributeList}</ul>);
  }
  render() {
    return this.renderPopup((
      <div className='popup-content'>
        <div className='attrib-container frame'>
          {this.buildAttributes(this.props.features[0])}
        </div>
      </div>
    ));
  }
}

class App extends Component {
  componentDidMount() {
    //set map center
    store.dispatch(SdkMapActions.setView([-114, 51], 9));

  // add the OSM source
  store.dispatch(SdkMapActions.addOsmSource('osm'));

  // add an OSM layer
  store.dispatch(SdkMapActions.addLayer({
    id: 'osm',
    source: 'osm',
  }));
  this.addLayerFromSensorUp('https://stlouis18-02515.sensorup.com/v1.0/Observations?$expand=FeatureOfInterest', 'Observations');
  // Copy the following line to add more data changing the url, and name
  // Talk to Willie if you want to change image styles between types
  // this.addLayerFromGeoJSON('https://raw.githubusercontent.com/OpenDataSTL/arch2park/master/Landmarks.geojson', 'landmark');

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
addLayerFromSensorUp(url, sourceName) {
    // Fetch URL
    fetch(url)
      .then(
        response => response.json(),
        error => console.error('An error occured.', error),
      )
      // addFeatures with the features, source name
      .then((json) => {
        // Map sensor up data to geojson deature
        const geoJsonData = json.value.map(function(location) {
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: location.FeatureOfInterest.feature.coordinates,
            },
            properties: location.FeatureOfInterest
          };
        });
        // add features to geojson obj
        const geoJson = {
          type: "FeatureCollection",
          crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
          features: geoJsonData
        };
        // add geojson obj to map
        store.dispatch(SdkMapActions.addSource(sourceName, {
          type: 'geojson',
          data: geoJson
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
        <SdkMap store={store}
          includeFeaturesOnClick
          onClick={(map, xy, featuresPromise) => {
            featuresPromise.then((featureGroups) => {
              // setup an array for all the features returned in the promise.
              let features = [];

              // featureGroups is an array of objects. The key of each object
              // is a layer from the map.
              for (let g = 0, gg = featureGroups.length; g < gg; g++) {
                // collect every feature from each layer.
                const layers = Object.keys(featureGroups[g]);
                for (let l = 0, ll = layers.length; l < ll; l++) {
                  const layer = layers[l];
                  features = features.concat(featureGroups[g][layer]);
                }
              }

              if (features.length === 0) {
                // no features, :( Let the user know nothing was there.
                map.addPopup(<SdkPopup coordinate={xy} closeable><i>No features found.</i></SdkPopup>);
              } else {
                // Show the super advanced fun popup!
                map.addPopup(<FeaturePopup coordinate={xy} features={features} closeable />);
              }
            }).catch((exception) => {
              console.error('An error occurred.', exception);
            });
          }}
        />
      </div>
    );
  }
}

export default App;
