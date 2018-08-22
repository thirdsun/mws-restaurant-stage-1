/**
* Register Service Worker if browser supports it.
*/
registerServiceWorker = ()=> {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {scope: '/'});
  }
}
