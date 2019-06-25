const staticCacheName = 'site-static-v5';
const dynamicCacheName = 'site-dynamic-v1';

const assets = [
	'/',
	'/index.html',
	'/js/app.js',
	'/js/materialize.min.js',
	'/css/styles.css',
	'/css/materialize.min.css',
	'/img/dish.png',
	'https://fonts.googleapis.com/icon?family=Material+Icons',
	'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2',
	'/pages/fallback.html'
];

const limitCacheSize = (name , size) => {
	caches.open(name)
		.then(cache => {
			cache.keys().then(keys => {
				if(keys.length > size){
					cache.delete(keys[0]).then(limitCacheSize(name , size));
			} });
		});
}

self.addEventListener('install' , e => {
	//console.log('Service Worker installed');
	e.waitUntil(
	caches.open(staticCacheName)
		.then(cache => {
			console.log('caching assets');
			cache.addAll(assets);
		})
	);
});

self.addEventListener('active' , e => {
	//console.log('Service Worker activated');
	e.waitUntil(
		caches.keys().then(keys => {
			//console.log(keys);
			return Promise.all(keys
				.filter(key => key !== staticCacheName && key !== dynamicCacheName)
				.map(key => caches.delete(key))
				)
		})
	);
});

self.addEventListener('fetch' , e => {
	//console.log('fetch event' , e);
	if(e.request.url.indexOf('firestore.googleapis.com') === -1){
		e.respondWith(
			caches.match(e.request)
				.then(cacheRes => {
					return cacheRes || fetch(e.request).then(fetchRes => {
						return caches.open(dynamicCacheName)
								.then(cache => {
									cache.put(e.request.url , fetchRes.clone());
									limitCacheSize(dynamicCacheName ,15);
									return fetchRes;
								})
					});
				})
				.catch(() => {
					if(e.request.url.indexOf('.html') > -1){
					return caches.match('/pages/fallback.html')
					}
		        })
		);
    }
    
});
