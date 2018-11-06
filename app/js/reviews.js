let restaurant;

const documentReady = () => {
  console.log('Ready');
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      console.error(error);
    } else {
      fillBreadcrumb();
    }
  });
  DBHelper.nextRequest();
}

fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    const error = 'No ID in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  const imageBase = DBHelper.imageUrlForRestaurant(restaurant);
  const image1x = imageBase + '-400_small_1x.jpg';
  const image2x = imageBase + '-800_large_2x.jpg';
  image.src = image2x;
  image.sizes = '(max-width: 767px) 100vw, (min-width: 768px) 50vw';
  image.srcset = `${image1x} 400w, ${image2x} 800w`;
  image.alt = 'A picture from ' + restaurant.name;

  const isFavorite = (restaurant['is_favorite'] && restaurant['is_favorite'].toString() === 'true')
    ? true
    : false;
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

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

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

saveReview = () => {
  const name = document.getElementById('reviewName').value;
  const rating = document.getElementById('reviewRating').value - 0;
  const comment = document.getElementById('reviewComment').value;

  console.log('reviewName: ', name)

  DBHelper.saveReview(self.restaurant.id, name, rating, comment, (error, review) => {
    console.log('Saving Review');
    if (error) {
      console.log('error saving review');
    }

    const reviewButton = document.getElementById('saveReviewButton');
    reviewButton.onclick = event => saveReview();

    window.location.href = '/restaurant.html?id=' + self.restaurant.id;
  });
}
