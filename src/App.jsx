import './App.sass';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { parse } from 'node-html-parser';
import { XMLParser } from 'fast-xml-parser';
import { Table } from 'react-bootstrap';
import { Marker, Popup, TileLayer, MapContainer } from 'react-leaflet';
import locations_countries from './locations0.json';
import locations_cities from './locations1.json';
import L from 'leaflet'
import marker_icon_2x from 'leaflet/dist/images/marker-icon-2x.png'
import marker_icon from 'leaflet/dist/images/marker-icon.png'
import marker_shadow from 'leaflet/dist/images/marker-shadow.png'
import 'leaflet/dist/leaflet.css';

const parser = new XMLParser();

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker_icon_2x,
  iconUrl: marker_icon,
  shadowUrl: marker_shadow
});

function Map({ jobsPositions }) {

  const position = [0, 0]

  return (
    <MapContainer className='map' center={position} zoom={1} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {
        jobsPositions.map((e, idx) => (
          <Marker position={[e.position[0] + Math.random(), e.position[1] + Math.random()]} key={idx}>
            <Popup>
              <a href={e.link} target="_blank">
                {e.title}
              </a>
            </Popup>
          </Marker>
        ))
      }
    </MapContainer>
  )
}

function extract_location(data) {
  const obj = parse(data);
  const ele = obj.querySelector('.chart-box').querySelector('.b').querySelectorAll('td')[1];
  return ele.textContent;
}

function extract_center(str) {
  const name = str.split(' - ');
  if ((name.length === 2) && (name[1] in locations_cities)) {
    return locations_countries[name[0]];
  }
  else if (name[0] in locations_countries) {
    return locations_countries[name[0]]
  }
  else {
    return [0, 0];
  }
}

function App() {

  const [data, setData] = useState([]);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    axios.get("https://ammardab3an.github.io/rss/sample_data.xml")
      .then(res => {
        const markers = [];
        const data = parser.parse(res.data)['rss']['channel']['item'];
        data.map((e, idx) => {
          const location_city = extract_location(e.description);
          const location_center = extract_center(location_city);
          markers.push({
            title: e.title,
            link: e.link,
            position: location_center
          })
        });
        setData(data);
        setMarkers(markers);
      }
      );
  }, []);

  // useEffect(()=>{
  //   console.log(markers);
  // }, [markers]);

  return (

    <>
      <Map jobsPositions={markers} />
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Division</th>
            <th>Country</th>
            <th className='d-none d-sm-table-cell'>Location</th>
            <th className='d-none d-md-table-cell'>lng</th>
            <th className='d-none d-md-table-cell'>lat</th>
          </tr>
        </thead>

        <tbody>
          {
            data.map((e, idx) => {

              const location_city = extract_location(e.description);
              const location_center = extract_center(location_city);

              return (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <a href={e.link} target="_blank">
                      {e.title}
                    </a>
                  </td>
                  <td>{e.division}</td>
                  <td>{e.country}</td>
                  <td className='d-none d-sm-table-cell'>{location_city}</td>
                  <td className='d-none d-md-table-cell'>{location_center[0]}</td>
                  <td className='d-none d-md-table-cell'>{location_center[1]}</td>
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    </>
  );
}

export default App;
