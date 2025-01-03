const CACHE_NAME = 'v2'; // إصدار جديد من الذاكرة المؤقتة
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/script.js',
    '/series.js',
    '/movies.js',
    '/details.js',
    '/admin.js',
    '/style.css',
    '/media.css',
    '/admin.css',
    '/details.css',
    // أضف هنا أي ملفات أخرى تريد تخزينها مؤقتًا
];

// تثبيت Service Worker وتخزين الملفات مؤقتًا
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('تم تخزين الملفات مؤقتًا بنجاح');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((err) => {
                console.error('فشل في تخزين الملفات مؤقتًا:', err);
            })
    );
});

// تفعيل Service Worker وحذف الذاكرة المؤقتة القديمة
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('حذف الذاكرة المؤقتة القديمة:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// استرجاع الملفات من الذاكرة المؤقتة أو من الشبكة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log('تم استرجاع الملف من الذاكرة المؤقتة:', event.request.url);
                    return response; // استرجاع الملف من الذاكرة المؤقتة
                }

                // إذا لم يكن الملف موجودًا في الذاكرة المؤقتة، قم بتحميله من الشبكة
                return fetch(event.request)
                    .then((networkResponse) => {
                        // تخزين الملف الجديد في الذاكرة المؤقتة
                        return caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, networkResponse.clone());
                                console.log('تم تخزين الملف الجديد في الذاكرة المؤقتة:', event.request.url);
                                return networkResponse;
                            });
                    })
                    .catch((err) => {
                        console.error('فشل في تحميل الملف من الشبكة:', err);
                        // يمكنك هنا عرض صفحة بديلة أو رسالة خطأ
                        return new Response('عذرًا، لا يمكن تحميل الصفحة حاليًا.', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({ 'Content-Type': 'text/plain' })
                        });
                    });
            })
    );
});