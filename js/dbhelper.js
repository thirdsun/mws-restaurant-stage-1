/**
 * Common database helper functions.
 */
let NeighborhoodsList;
let CuisinesList;

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback, id) {
    let fetchUrl;
    if (!id) {
      fetchUrl = DBHelper.DATABASE_URL;
    } else {
      fetchUrl = DBhelper.DATABASE_URL + "/" + id;
    }

    fetch(fetchUrl, {method: "GET"}).then(response => {
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
          callback('Restaurant does not exist', null);
        }
      }
    }, id);
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
        if (cuisine != "all") { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") { // filter by neighborhood
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

}
