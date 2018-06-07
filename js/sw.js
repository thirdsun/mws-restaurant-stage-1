var staticCacheName = 'Restaurant-Reviews-V3';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        '/js/main.js',
        '/js/dbhelper.js',
        '/js/restaurant_info.js',
        '/css/styles.css',
        '/data/restaurants.json',
        '/',
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
      ]);
    })
  );
});
