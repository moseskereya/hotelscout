import React, { Component, createRef } from 'react';
import { GoogleApiWrapper, Map, Marker } from 'google-maps-react';
import Hotel from "./Hotel"
import {Autocomplete} from "@react-google-maps/api"
import { FiSearch } from 'react-icons/fi';
import Popup from './Popup';
class Maps extends Component {
  constructor(props) {
    super(props);
    this.mapRef = createRef();
    this.searchInputRef = createRef();
  }

  state = {
    hotels: [],
    currentLocation: null,
    activeMarker: null,
    selectedPlace: null,
    zoom: 16,
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
            gestureHandling: "cooperative",
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
  
            this.searchInputRef.current.addEventListener('keydown', (event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                this.handleSearch();
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

    window.addEventListener('resize', this.handleWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowResize);
  }

  handleWindowResize = () => {
    const screenWidth = window.innerWidth;
    let zoomLevel;
    if (screenWidth < 500) {
      zoomLevel = 19;
    } else if (screenWidth < 960) {
      zoomLevel = 16;
    } else {
      zoomLevel = 18;
    }
    this.setState({ zoom: zoomLevel });
  };




  handleSearch = () => {
    const { google } = this.props;
    const { map, service } = this.state;
    const searchQuery = this.searchInputRef.current.value.trim();
    if (map && service && searchQuery !== '') {
      const request = {
        query: searchQuery,
      };
  
      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const hotels = results.map((place) => ({
            position: place.geometry.location,
            name: place.name,
            image: place.photos ? place.photos[0].getUrl() : null,
            rating: place.rating ? place.rating : null,
          }));
  
          this.setState({ hotels });
  
          if (results.length > 0) {
            const { geometry } = results[0];
            const { location } = geometry;
  
            map.panTo(location);
  
            const { lat, lng } = location;
            this.setState({ currentLocation: { lat: lat(), lng: lng() } });
          } else {
            console.warn('No results found for the search query:', searchQuery);
          }
        } else {
          console.error('Places service request failed:', status);
        }
      });
    }
  };

  fetchHotels(service, bounds) {
    const request = {
      bounds: bounds,
      query: 'hotels',
    };
  
    service.textSearch(request, (results, status) => {
      if (status === this.props.google.maps.places.PlacesServiceStatus.OK) {
        const hotelPromises = results.map((place) => {
          return new Promise((resolve) => {
            const placeRequest = {
              placeId: place.place_id,
              fields: ['name', 'geometry', 'rating', 'photos', 'website', 'formatted_phone_number', 'price_level', 'formatted_address', 'reviews'],
            };
  
            service.getDetails(placeRequest, (placeResult, placeStatus) => {
              if (placeStatus === this.props.google.maps.places.PlacesServiceStatus.OK) {
                const hotel = {
                  position: placeResult.geometry.location,
                  name: placeResult.name,
                  image: placeResult.photos ? placeResult.photos[0].getUrl() : null,
                  rating: placeResult.rating ? placeResult.rating : null,
                  website: placeResult.website,
                  phoneNumber: placeResult.formatted_phone_number,
                  priceLevel: placeResult.price_level,
                  address: placeResult.formatted_address,
                  reviews: placeResult.reviews ? placeResult.reviews.map((review) => ({
                    rating: review.rating,
                    text: review.text,
                    authorName: review.author_name,
                    authorEmail: review.author_email,
                    authorPhoto: review.profile_photo_url,
                  })) : [],
                  description: placeResult.formatted_address
                };
                resolve(hotel);
              } else {
                console.error('Place details request failed:', placeStatus);
                resolve(null);
              }
            });
          });
        });
  
        Promise.all(hotelPromises).then((hotels) => {
          const filteredHotels = hotels.filter((hotel) => hotel !== null);
          this.setState({ hotels: filteredHotels });
        });
      } else {
        console.error('Places service request failed:', status);
      }
    });
  }
  

  handleHotelClick = (hotel) => {
    this.setState({
      selectedPlace: hotel
    });
  };

  handleClosePopup = () => {
    this.setState({
      activeMarker: null,
      selectedPlace: null,
    });
  };


  render() {
    const { hotels, currentLocation, selectedPlace, zoom, selectedHotel, } = this.state;
    const onLoad = (autoComplete) => this.handleSearch(autoComplete);
    return (
      <>
        <header>
          <h4>Hotel Scout</h4>
          <div className='hotel-search'>
        <Autocomplete  onLoad = {onLoad} onPlaceChanged={this.handleSearch}>
          <input type='text' placeholder="Search..." ref={this.searchInputRef} /> 
       </Autocomplete>
       <div className="search-icon">
        <FiSearch />
      </div>
        </div>
        </header>
        <div ref={this.mapRef} className="map_container">
          {currentLocation && (
            <Map google={this.props.google} zoom={zoom} center={currentLocation || selectedHotel} initialCenter={currentLocation}>
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

            {hotels.map((marker, index, hotel) => (
              <Marker
                key={index}
                position={marker.position}
                name={marker.name}
                onClick={() => this.handleHotelClick(marker)}
                image={marker.image}
                rating={marker.rating}
              />
            ))}
           {selectedPlace && <Popup selectedPlace={selectedPlace} onClose={() => this.setState({ selectedPlace: null })} />}           
            </Map>
          )}
        </div>
        <div className='hotels_list'>
          <div className='hotel'>
          {hotels?.map((hotel, index) => (
            <Hotel key={index} 
            hotel={hotel}  
            onClick={this.handleHotelClick}/>
          ))}
          </div>
        </div>
      </>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.GOOGLE_MAP_API_KEYS
})(Maps);
