let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false,
        zoomControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
  DBHelper.nextRequest();
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

  const div = document.getElementById("restaurant-container");
  const isFavorite = (restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true") ? true : false;
  const favoriteDiv = document.createElement('div');
  favoriteDiv.id = 'favoriteDiv';
  const favorite = document.createElement('button');
  favorite.className = 'favorite-button';
  favorite.style.background = isFavorite
    ? `url('/icons/favorite.svg') no-repeat`
    : `url('/icons/not_favorite.svg') no-repeat`;
  favorite.innerHTML = isFavorite
    ? restaurant.name + ' is a favorite'
    : restaurant.name + ' is not a favorite';
  favorite.id = 'favorite-button-' + restaurant.id;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !isFavorite);
  favoriteDiv.append(favorite);
  div.append(favoriteDiv);

  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  const imageBase = DBHelper.imageUrlForRestaurant(restaurant);
  const image1x = imageBase + '-400_small_1x.jpg';
  const image2x = imageBase + '-800_large_2x.jpg';
  image.src = image2x;
  image.sizes = '(max-width: 767px) 100vw, (min-width: 768px) 50vw';
  image.srcset = `${image1x} 400w, ${image2x} 800w`;
  image.alt = 'A picture from ' + restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewsById(restaurant.id, fillReviewsHTML)
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (error, reviews) => {
  self.restaurant.reviews = reviews;

  if (error) {
    console.log('error with getting reviews: ', error);
  }

  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  addReview = document.createElement('a');
  addReview.href = `/review.html?id=${self.restaurant.id}`;
  addReview.id = 'addReview';
  addReview.innerHTML = 'Add a Review';
  container.appendChild(addReview);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  const created = review.createdAt;
  date.innerHTML = new Date(created).toLocaleString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

handleFavoriteClick = (id, newState) => {
  const favorite = document.getElementById('favorite-button-' + id);
  self.restaurant['is_favorite'] = newState;
  favorite.onclick = event => handleFavoriteClick(restaurant.id, !self.restaurant['is_favorite']);
  DBHelper.handleFavoriteClick(id, newState);
};
