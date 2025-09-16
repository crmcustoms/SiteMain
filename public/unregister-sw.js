// Немедленно отключаем сервис-воркер при загрузке страницы
(function() {
  console.log('Скрипт отмены регистрации сервис-воркера запущен');

  if ('serviceWorker' in navigator) {
    // Отменяем регистрацию всех сервис-воркеров
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      if (registrations.length > 0) {
        console.log(`Найдено ${registrations.length} сервис-воркеров для отключения`);
        
        for (let registration of registrations) {
          console.log('Отключаем сервис-воркер:', registration.scope);
          registration.unregister().then(function(success) {
            if (success) {
              console.log('Сервис-воркер успешно отключен:', registration.scope);
            } else {
              console.error('Не удалось отключить сервис-воркер:', registration.scope);
            }
          }).catch(function(error) {
            console.error('Ошибка при отключении сервис-воркера:', error);
          });
        }
      } else {
        console.log('Активные сервис-воркеры не найдены');
      }
    }).catch(function(error) {
      console.error('Ошибка при получении списка сервис-воркеров:', error);
    });
    
    // Очищаем кеш
    if ('caches' in window) {
      caches.keys().then(function(cacheNames) {
        if (cacheNames.length > 0) {
          console.log(`Найдено ${cacheNames.length} кешей для удаления`);
          
          cacheNames.forEach(function(cacheName) {
            console.log('Удаляем кеш:', cacheName);
            caches.delete(cacheName).then(function(success) {
              if (success) {
                console.log('Кеш успешно удален:', cacheName);
              } else {
                console.error('Не удалось удалить кеш:', cacheName);
              }
            }).catch(function(error) {
              console.error('Ошибка при удалении кеша:', error);
            });
          });
        } else {
          console.log('Активные кеши не найдены');
        }
      }).catch(function(error) {
        console.error('Ошибка при получении списка кешей:', error);
      });
    }
  } else {
    console.log('Сервис-воркеры не поддерживаются в этом браузере');
  }
  
  // Устанавливаем флаг в localStorage для предотвращения регистрации сервис-воркера в будущем
  try {
    localStorage.setItem('disable-service-worker', 'true');
    console.log('Установлен флаг для предотвращения регистрации сервис-воркера');
  } catch (e) {
    console.error('Не удалось установить флаг в localStorage:', e);
  }
})(); 