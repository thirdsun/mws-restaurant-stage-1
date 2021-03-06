let restaurants,
  neighborhoods,
  cuisines;
var map;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  registerServiceWorker();
});

/**
* Register Service Worker if browser supports it.
*/
 registerServiceWorker = ()=> {
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
 }

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false,
    zoomControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = ('restaurant-img' + ' lazyload');
  const imageBase = DBHelper.imageUrlForRestaurant(restaurant);
  const image1x = imageBase + '-400_small_1x.jpg';
  const image2x = imageBase + '-800_large_2x.jpg';
  const placeholder = '/img/placeholder.jpg';
  image.src = placeholder;
  image.sizes = '(max-width: 767px) 100vw, (min-width: 768px) 50vw';
  image.alt = 'A picture from ' + restaurant.name;
  image.setAttribute('data-src', `${image2x}`);
  image.setAttribute('data-srcset', `${image1x} 400w, ${image2x} 800w`);
  li.append(image);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);

  console.log('is_favorite: ', restaurant['is_favorite']);
  const isFavorite = (restaurant['is_favorite'] && restaurant['is_favorite'].toString() === 'true') ? true : false;
  const favorite = document.createElement('button');
  favorite.className = 'favorite-button';
  favorite.style.background = isFavorite
    ? `url('/icons/favorite.svg') no-repeat`
    : `url('/icons/not_favorite.svg') no-repeat`;
  favorite.innerHTML = isFavorite
    ? restaurant.name + ' is saved as favorite'
    : restaurant.name + ' is not a favorite';
  favorite.id = 'favorite-button-' + restaurant.id;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !isFavorite);
  li.append(favorite);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', 'View Details');
  li.append(more)

  return li
};

/**
* Handle click for favorited restaurants
*/
handleFavoriteClick = (id, newState) => {
  const favorite = document.getElementById('favorite-button-' + id);
  const restaurant = self
    .restaurants
    .filter(r => r.id === id)[0];
  if (!restaurant)
    return;
  restaurant['is_favorite'] = newState;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !restaurant['is_favorite']);
  DBHelper.handleFavoriteClick(id, newState);
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
