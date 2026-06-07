// Service Worker para Firebase Cloud Messaging (FCM)
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBFdfMUErNmooLwIosiacr5gRrlrSefdMk",
  authDomain: "gipp-sistemas.firebaseapp.com",
  projectId: "gipp-sistemas",
  storageBucket: "gipp-sistemas.firebasestorage.app",
  messagingSenderId: "229490807877",
  appId: "1:229490807877:web:9ef442ee1012050fcbbf2c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em segundo plano: ', payload);
  const notificationTitle = payload.notification?.title || 'Mensagem do GIPP';
  
  // Forçar preferencialmente os ícones oficiais do GIPP para evitar ícones genéricos do ecossistema de hospedagem
  const systemIcon = payload.notification?.icon || 'https://cdn-icons-png.flaticon.com/512/3004/3004613.png';
  const systemBadge = payload.notification?.badge || systemIcon;

  const notificationOptions = {
    body: payload.notification?.body || 'Você possui uma nova atualização.',
    icon: systemIcon,
    badge: systemBadge,
    data: {
      url: payload.data?.url || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
