importScripts('js/idb.js');

var staticCacheName = 'Restaurant-Reviews-V4';

const dbPromise = idb.open('restaurant-db', 2, upgradeDB => {
  switch (upgradeDB.oldVersion) {
    case 0:
      upgradeDB.createObjectStore('restaurants', {keyPath: 'id'});
    case 1:
      upgradeDB.createObjectStore('pending', {
        keyPath: 'id',
        autoIncrement: true
      });
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/sw.js',
        '/js/main.js',
        '/js/dbhelper.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
        '/css/tablet.css',
        'css/desktop.css',
        '/index.html',
        '/restaurant.html',
        '/img/1-400_small_1x.jpg',
        '/img/1-800_large_2x.jpg',
        '/img/2-400_small_1x.jpg',
        '/img/2-800_large_2x.jpg',
        '/img/3-400_small_1x.jpg',
        '/img/3-800_large_2x.jpg',
        '/img/4-400_small_1x.jpg',
        '/img/4-800_large_2x.jpg',
        '/img/5-400_small_1x.jpg',
        '/img/5-800_large_2x.jpg',
        '/img/6-400_small_1x.jpg',
        '/img/6-800_large_2x.jpg',
        '/img/7-400_small_1x.jpg',
        '/img/7-800_large_2x.jpg',
        '/img/8-400_small_1x.jpg',
        '/img/8-800_large_2x.jpg',
        '/img/9-400_small_1x.jpg',
        '/img/9-800_large_2x.jpg',
        '/img/10-400_small_1x.jpg',
        '/img/10-800_large_2x.jpg'
      ]).catch(error => {
        console.log('Caching failed: ' + error);
      });
    })
  );
});

self.addEventListener('fetch', event => {
  let newRequest = event.request;
  let newUrl = new URL(event.request.url);
  if (event.request.url.indexOf('restaurant.html') > -1) {
    const baseUrl = 'restaurant.html';
    newRequest = new Request(baseUrl);
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.port === '1337') {
    const urlBits = requestUrl.pathname.split('/');
    let id = requestUrl.searchParams.get('restaurant_id') - 0;
    if (!id) {
      if (requestUrl.pathname.indexOf('restaurants')) {
        id = urlBits[urlBits.length - 1] === 'restaurants' ? '-1' : urlBits[urlBits.length - 1];
      } else {
        id = requestUrl.searchParams.get('restaurant_id');
      }
    }
    fetchHandler(event, id);
  } else {
    nonFetchHandler(event, newRequest);
  }
});

const fetchHandler = (event, id) => {
  event.respondWith(dbPromise.then(db => {
    return db.transaction('restaurants')
      .objectStore('restaurants')
      .get(id);
  }).then(data => {
    return (data && data.data) || fetch(event.request)
      .then(fetchResponse => fetchResponse.json())
      .then(json => {
        return dbPromise.then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');
          store.put({id: id, data: json});
          return json;
        });
      });
  }).then(finalResponse => {
    return new Response(JSON.stringify(finalResponse));
  }).catch(error => {
    return new Response('Error receiving data', {status: 500});
  }));
};

const nonFetchHandler = (event, newRequest) => {
  event.respondWith(caches.match(newRequest).then(response => {
    return (response || fetch(event.request).then(fetchResponse => {
      return caches.open(staticCacheName)
        .then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
    }).catch(error => {
      return new Response("Not connected to internet", {
        status: 404,
        statusText: "Not connected to internet"
      }
    );
    }));
  }));
};
