/**
 * Common database helper functions.
 */
let NeighborhoodsList;
let CuisinesList;

const dbPromise = idb.open('restaurant-db', 3, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    case 1:
      upgradeDB.createObjectStore('pending', {
        keyPath: 'id',
        autoIncrement: true
      });
    case 2:
      {
        const reviewsStore = upgradeDB.createObjectStore('reviews', {keyPath: 'id'});
        reviewsStore.createIndex('restaurant_id', 'restaurant_id');
      }
  }
});

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  static get DATABASE_REVIEWS_URL() {
    const port = 1337;
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {
    let fetchUrl;
    if (!id) {
      fetchUrl = DBHelper.DATABASE_URL;
    } else {
      fetchUrl = DBHelper.DATABASE_URL + '/' + id;
    }

    fetch(fetchUrl, {method: 'GET'}).then(response => {
      response.json()
      .then(restaurants => {
        if (restaurants.length) {
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
          //Remove duplicate neighborhoods
          NeighborhoodsList = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);

          //Get cuisines
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
          //Remove duplicate cuisines
          CuisinesList = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        }

        callback(null, restaurants);
      });
    }).catch(error => {
      callback(`Request failed due to ${error}`, null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants;
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('There is no restaurant by that name.', null);
        }
      }
    }, id);
  }

  static fetchReviewsById(id, callback) {
    const fetchURL = DBHelper.DATABASE_REVIEWS_URL + '/?restaurant_id=' + id;
    fetch(fetchURL, {method: 'GET'}).then(response => {
      if (!response.clone().ok && !response.clone().redirected) {
        throw 'No reviews at this time';
      }
      response.json().then(result => {
        callback(null, result);
      })
    }).catch(error => callback(error, null));
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    if (NeighborhoodsList) {
      callback(null, NeighborhoodsList);
      return;
    }

    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        NeighborhoodsList = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, NeighborhoodsList);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    if (CuisinesList) {
      callback(null, CuisinesList);
      return;
    }

    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        CuisinesList = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, CuisinesList);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph) {
      return (`/img/${restaurant.photograph}`);
    }
    return (`/img/${restaurant.id}`);
  }

  /**
  * Sizes for restaurant image.
  *
  static imageSizesForRestaurant(restaurant) {
    return ("(max-width: 767px) 100vw, (min-width: 768px) 50vw");
  }*/

  /**
  * SrcSet for restaurant image.
  *
  static imageSrcSetForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph_srcset}`);
  }*/

  /**
  * Alt text for restaurant image.

  static imageAltForRestaurant(restaurant) {
    return (`${restaurant.photograph_alt}`);
  }*/

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static addRequestToQueue(url, method, body) {
    const dbPromise = idb.open('restaurant-db');
    dbPromise.then(db => {
      const tx = db.transaction('pending', 'readwrite');
      tx.objectStore('pending')
        .put({
          data: {
            url,
            method,
            body
          }
        })
    }).catch(error => {})
      .then(DBHelper.nextRequest());
  }

  static nextRequest() {
    DBHelper.commitRequest(DBHelper.nextRequest);
  }

  static commitRequest(callback) {
    let url;
    let method;
    let body;

    dbPromise.then(db => {
      if (!db.objectStoreNames.length) {
        console.log('no database found');
        db.close();
        return;
      }

      const tx = db.transaction('pending', 'readwrite');
      tx.objectStore('pending')
        .openCursor()
        .then(cursor => {
          if (!cursor) {
            return;
          }
          const value = cursor.value;
          url = cursor.value.data.url;
          method = cursor.value.data.method;
          body = cursor.value.data.body;

          if ((!url || !method) || (method === 'POST' && !body)) {
            cursor.delete()
              .then(callback());
            return;
          };

          const properties = {
            body: JSON.stringify(body),
            method: method
          }
          console.log('adding from queue: ', properties);
          fetch(url, properties)
            .then(response => {
              if (!response.ok && !response.redirected) {
                return;
              }
            }).then(() => {
              const deleteTransaction = db.transaction('pending', 'readwrite');
              deleteTransaction.objectStore('pending')
                .openCursor()
                .then(cursor => {
                  cursor.delete()
                    .then(() => {
                      callback();
                    })
                })
                console.log('deleted pending item from queue')
            })
        }).catch(error => {
          console.log('error with cursor');
          return;
        })
    })
  }

  static updateRestaurantCache(id, updateInfo) {
    const dbPromise = idb.open('restaurant-db');
    dbPromise.then(db => {
      console.log('Performing Transaction');
      const tx = db.transaction('restaurants', 'readwrite');
      const value = tx.objectStore('restaurants')
        .get('-1')
        .then(value => {
          if (!value) {
            console.log('Nothing in cache!');
            return;
          }

          const data = value.data;
          const restArray = data.filter(r => r.id === id);
          const restObject = restArray[0];
          if (!restObject)
            return;
          const keys = Object.keys(updateInfo);
          keys.forEach(k => {
            restObject[k] = updateInfo[k];
          })

          dbPromise.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            tx.objectStore('restaurants')
              .put({id: '-1', data: data});
            return tx.complete;
          })
        })
    })

    dbPromise.then(db => {
      console.log('Performing transaction');
      const tx = db.transaction('restaurants', 'readwrite');
      const value = tx.objectStore('restaurants')
        .get(id + '')
        .then(value => {
          if (!value) {
            console.log('Nothing in cache');
            return;
          }
          const restObject = value.data;
          console.log('Restaurant info for: ', restObject);
          if (!restObject)
            return;
          const keys = Object.keys(updateInfo);
          keys.forEach(k => {
            restObject[k] = updateInfo[k];
          })

          dbPromise.then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            tx.objectStore('restaurants')
              .put({
              id: id + '',
              data: restObject
              });
            return tx.complete;
          })
        })
    })
  }

  static updateFavorite(id, newState, callback) {
    const url = `${DBHelper.DATABASE_URL}/${id}/?is_favorite=${newState}`;
    const method = 'PUT';
    DBHelper.updateRestaurantCache(id, {'is_favorite': newState});
    DBHelper.addRequestToQueue(url, method);

    callback(null, {id, value: newState});
  }

  static handleFavoriteClick(id, newState) {
    const fav = document.getElementById('favorite-button-' + id);
    fav.onclick = null;

    DBHelper.updateFavorite(id, newState, (error, resultObj) => {
      if (error) {
        console.log('Error Updating Favorite');
        return;
      }
      const favorite = document.getElementById('favorite-button-' + resultObj.id);
      favorite.style.background = resultObj.value
        ? `url('/icons/favorite.svg') no-repeat`
        : `url('/icons/not_favorite.svg') no-repeat`;
    });
  }

  static updateCachedReview(id, bodyObj) {
    console.log('updating review: ', bodyObj);
    dbPromise.then(db => {
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');
      console.log('adding review to store');
      store.put({
        id: Date.now(),
        'restaurant_id': id,
        data: bodyObj
      });
      console.log('review successfully added to store');
      return tx.complete;
    })
  }

  static saveNewReview(id, bodyObj, callback) {
    const url = `${DBHelper.DATABASE_REVIEWS_URL}`;
    const method = 'POST';
    DBHelper.updateCachedReview(id, bodyObj);
    DBHelper.addRequestToQueue(url, method, bodyObj);
    callback(null, null)
  }

  static saveReview(id, name, rating, comment, callback) {
    const button = document.getElementById('reviewButton');
    button.onclick = null;

    const body = {
      restaurant_id: id,
      name: name,
      rating: rating,
      comments: comment,
      createdAt: Date.now()
    }

    DBHelper.saveNewReview(id, body, (error, result) => {
      if (error) {
        callback(error, null);
        return;
      }
      callback(null, result);
    })
  }
}

window.DBHelper = DBHelper;
