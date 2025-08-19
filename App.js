import { useRef, useState, useEffect } from 'react';
import {
   Platform,
   View,
   BackHandler,
   StatusBar,
   StyleSheet,
   ActivityIndicator,
   KeyboardAvoidingView,
   Keyboard,
   requireNativeComponent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const URL_SITE = 'https://inrut.ru';
// const URL_SITE = 'http://192.168.0.102:6001';

const injectedJS = `
(function() {
  function ensureVisible(el){
    if (!el) return;
    setTimeout(function() {
      try {
        if (el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } else {
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100);
        }
      } catch(e){}
    }, 60);
  }

  // Слушаем фокус для элементов ввода
  document.addEventListener('focusin', function(e){
    var t = e.target;
    if (!t) return;
    var tag = (t.tagName || '').toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) {
      ensureVisible(t);
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'input-focus' }));
      } catch(e){}
    }
  });

  document.addEventListener('focusout', function(){
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'input-blur' }));
    } catch(e){}
  });

  // Поддержка visualViewport (современные браузеры в WebView)
  if (window.visualViewport) {
    var lastDelta = 0;
    window.visualViewport.addEventListener('resize', function(){
      var delta = window.innerHeight - window.visualViewport.height;
      if (delta > 0) {
        // добавляем padding "внизу" документа, чтобы содержимое не скрывалось под клавиатурой
        document.documentElement.style.paddingBottom = delta + 'px';
      } else {
        document.documentElement.style.paddingBottom = '';
      }
      lastDelta = delta;
    });
  } else {
    // fallback: пробуем отслеживать изменение innerHeight
    var lastInner = window.innerHeight;
    setInterval(function(){
      if (Math.abs(window.innerHeight - lastInner) > 100) {
        // вероятное появление/скрытие клавиатуры
        // не очень тонкий, но часто работает
        lastInner = window.innerHeight;
        try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'viewport-change', height: lastInner })); } catch(e){}
      }
    }, 300);
  }

  // Простая наблюдалка за document.cookie — когда меняются куки, шлём их в RN
  (function(){
    var last = document.cookie;
    setInterval(function(){
      if (document.cookie !== last) {
        last = document.cookie;
        try { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cookies', cookies: document.cookie })); } catch(e){}
      }
    }, 500);
  })();

  true;
})();
`;

Notifications.setNotificationHandler({
   handleNotification: async () => ({
      shouldPlaySound: true, // включить звук
      shouldSetBadge: true, // обновить бейдж (иконку)
      shouldShowBanner: true, // показать баннер (alert)
      shouldShowList: true, // добавить в список уведомлений
   }),
});

async function registerForPushNotificationsAsync() {
   if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
         const { status } = await Notifications.requestPermissionsAsync();
         finalStatus = status;
      }

      if (finalStatus !== 'granted') {
         return null;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      // alert(token)

      console.log('Expo Push Token:', token);
      return token;
   } else {
   }
}

export default function App() {
   return (
      <SafeAreaProvider>
         <InnerApp />
      </SafeAreaProvider>
   );
}

function InnerApp() {
   const webviewRef = useRef(null);
   const insets = useSafeAreaInsets();
   const [canGoBack, setCanGoBack] = useState(false);
   const [loading, setLoading] = useState(true);
   const [keyboardHeight, setKeyboardHeight] = useState(0);
   const [expoPushToken, setExpoPushToken] = useState(null);

   useEffect(() => {
      registerForPushNotificationsAsync().then(token => setExpoPushToken(token));
   }, []);

   useEffect(() => {
      const subscription = Notifications.addNotificationResponseReceivedListener(response => {
         const data = response.notification.request.content.data?.data;

         if (data?.dialog_id) {
            webviewRef.current?.postMessage(
               JSON.stringify({
                  type: 'open-dialog',
                  dialog_id: data.dialog_id,
               })
            );
         }
      });

      return () => subscription.remove();
   }, []);

   useEffect(() => {
      (async () => {
         try {
            await Camera.requestCameraPermissionsAsync();
         } catch (e) {
            console.warn('Camera permission request failed', e);
         }
         try {
            await Audio.requestPermissionsAsync();
         } catch (e) {
            console.warn('Audio permission request failed', e);
         }
      })();
   }, []);

   useEffect(() => {
      if (Platform.OS === 'android') {
         const backAction = () => {
            if (canGoBack && webviewRef.current) {
               webviewRef.current.goBack();
               return true;
            }
            return false;
         };
         const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
         return () => backHandler.remove();
      }
   }, [canGoBack]);

   useEffect(() => {
      (async () => {
         const saved = await AsyncStorage.getItem('site_cookies');
         if (saved) {
            try {
               const parsed = JSON.parse(saved);
               const host = new URL(URL_SITE).hostname;
               for (const [name, cookie] of Object.entries(parsed)) {
                  await CookieManager.set(URL_SITE, {
                     name,
                     value: cookie.value,
                     domain: cookie.domain ?? host,
                     path: cookie.path ?? '/',
                     secure: cookie.secure ?? true,
                     httpOnly: cookie.httpOnly ?? false,
                  });
               }
            } catch (e) {
               console.warn('Ошибка восстановления куков:', e);
            }
         }
      })();
   }, []);

   useEffect(() => {
      const showSub = Keyboard.addListener('keyboardDidShow', e => {
         const h = e?.endCoordinates?.height ?? 0;
         setKeyboardHeight(h);
      });
      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
         setKeyboardHeight(0);
      });
      return () => {
         showSub.remove();
         hideSub.remove();
      };
   }, []);

   const handleMessage = async event => {
      try {
         const data = JSON.parse(event.nativeEvent.data);
         if (data.type === 'auth' && expoPushToken) {
            if (data.status === 'logged_in') {
               console.log('add token', expoPushToken, data);
            }

            if (data.status === 'logged_out') {
               console.log('delete token', expoPushToken, data);
            }
         }

         if (data.type === 'cookies') {
            try {
               const cookies = await CookieManager.get(URL_SITE);
               await AsyncStorage.setItem('site_cookies', JSON.stringify(cookies));
            } catch (e) {}
         }
      } catch (e) {
         console.warn('Ошибка парсинга сообщения из WebView:', e);
      }
   };

   const bottomOffset = Platform.OS === 'ios' ? Math.max(insets.bottom, keyboardHeight) : keyboardHeight;

   return (
      <KeyboardAvoidingView
         style={{ flex: 1 }}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
         keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}>
         <SafeAreaView style={{ flex: 1 }}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            {loading && (
               <View style={styles.splash}>
                  <ActivityIndicator size="large" color="#000" />
               </View>
            )}

            <View style={{ flex: 1, paddingBottom: bottomOffset, backgroundColor: '#fff' }}>
               <WebView
                  ref={webviewRef}
                  source={{ uri: `${URL_SITE}/chat` }}
                  injectedJavaScript={injectedJS}
                  onMessage={handleMessage}
                  onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
                  onLoadEnd={() => {
                     CookieManager.get(URL_SITE)
                        .then(async cookies => {
                           try {
                              await AsyncStorage.setItem('site_cookies', JSON.stringify(cookies));
                           } catch (e) {
                              console.warn('Ошибка записи куков после загрузки:', e);
                           }
                        })
                        .catch(() => {});
                     setLoading(false);
                  }}
                  sharedCookiesEnabled
                  thirdPartyCookiesEnabled
                  allowsCameraAccess
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={['*']}
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback
                  androidCameraAccess
                  androidMicrophoneAccess
                  mediaCapturePermissionGrantType="grant"
                  style={{ flex: 1 }}
               />
            </View>
         </SafeAreaView>
      </KeyboardAvoidingView>
   );
}

const styles = StyleSheet.create({
   splash: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
   },
});
