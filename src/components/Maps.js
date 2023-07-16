import React, { Component, createRef } from 'react';
import { GoogleApiWrapper, Map, Marker, InfoWindow } from 'google-maps-react';
import Hotel from "./Hotel"
class Maps extends Component {
  constructor(props) {
    super(props);
    this.mapRef = createRef();
  }

  state = {
    hotels: [],
    currentLocation: null,
    activeMarker: null,
    selectedPlace: null,
    zoom: 16,
    autocomplete: ''
  };

  componentDidMount() {
    const { google } = this.props;
    if (navigator && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = { lat: latitude, lng: longitude };

          const mapOptions = {
            center: currentLocation,
            zoom: 18,
          };

          try {
            const map = new google.maps.Map(this.mapRef.current, mapOptions);
            const service = new google.maps.places.PlacesService(map);
            this.setState({ currentLocation, map, service });
            this.fetchHotels(service, map.getBounds());

            map.addListener('bounds_changed', () => {
              const newBounds = map.getBounds();
              if (newBounds) {
                this.fetchHotels(service, newBounds);
              }
            });
          } catch (error) {
            console.error('Error creating map:', error);
          }
        },
        (error) => {
          console.error('Error retrieving location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  

  fetchHotels(service, bounds) {
    const request = {
      bounds: bounds,
      query: 'hotels',
    };

    service.textSearch(request, (results, status) => {
      if (status === this.props.google.maps.places.PlacesServiceStatus.OK) {
        const hotels = results.map((place) => ({
          position: place.geometry.location,
          name: place.name,
          image: place.photos ? place.photos[0].getUrl() : null,
          rating: place.rating ? place.rating : null,
        }));

        this.setState({ hotels });
       console.log(this.state.hotels)
      } else {
        console.error('Places service request failed:', status);
      }
    });
  }

  onMarkerClick = (props, marker) => {
    this.setState({
      activeMarker: marker,
      selectedPlace: props,
    });
  };

  onCloseInfoWindow = () => {
    this.setState({
      activeMarker: null,
      selectedPlace: null,
    });
  };

  render() {
    const { hotels, currentLocation, activeMarker, selectedPlace, zoom } = this.state
      return (
        <>
        <div ref={this.mapRef} className="map_container">
          {currentLocation && (
            <Map google={this.props.google} zoom={zoom} initialCenter={currentLocation} gestureHandling="cooperative">
             <Marker
              position={currentLocation}
              className="user-location-dot"
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new this.props.google.maps.Size(40, 40),
                anchor: new this.props.google.maps.Point(20, 40),
                animation: this.props.google.maps.Animation.BOUNCE,
              }}
            />
  
              {hotels.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position}
                  name={marker.name}
                  onClick={this.onMarkerClick}
                  image={marker.image}
                  rating={marker.rating}
                />
              ))}
  
              <InfoWindow marker={activeMarker} visible={Boolean(activeMarker)}>
                <div>
                  {selectedPlace && (
                    <div>
                      {selectedPlace.name && <h3>{selectedPlace.name}</h3>}
                      {selectedPlace.image && (
                        <img src={selectedPlace.image} alt={selectedPlace.name} style={{ width: '120px', height: '100%' }} />
                      )}
                    </div>
                  )}
                </div>
              </InfoWindow>
            </Map>
          )}
        </div>
        <div className='hotels_list'>
           {hotels?.map((hotel, index) => (
             <Hotel key={index} hotel={hotel} />
           ))}
          </div>
        </>
      );
    }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyAl5nMA3rjGiV58HYm1mSlqTmuBdkDmkMw', 
})(Maps);
