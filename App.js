// import { useRef, useState, useEffect } from 'react';
// import { Platform, Dimensions, View, BackHandler, StatusBar, StyleSheet, ActivityIndicator, Keyboard, KeyboardAvoidingView } from 'react-native';
// import { WebView } from 'react-native-webview';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CookieManager from '@react-native-cookies/cookies';
// import { Camera } from 'expo-camera';
// import { Audio } from 'expo-av';

// function getBottomInset() {
//    if (Platform.OS === 'ios') {
//       const { height, width } = Dimensions.get('window');
//       const isIphoneWithNotch = !Platform.isPad && !Platform.isTV && (height >= 812 || width >= 812);
//       return isIphoneWithNotch ? 34 : 0;
//    } else {
//       const screenHeight = Dimensions.get('screen').height;
//       const windowHeight = Dimensions.get('window').height;
//       const navbarHeight = screenHeight - windowHeight - (StatusBar.currentHeight || 0);
//       return navbarHeight > 0 ? navbarHeight : 0;
//    }
// }

// export default function App() {
//    const webviewRef = useRef(null);
//    const [canGoBack, setCanGoBack] = useState(false);
//    const [loading, setLoading] = useState(true);
//    const [keyboardOpen, setKeyboardOpen] = useState(false);
//    const [bottomInset, setBottomInset] = useState(getBottomInset());

//    // const URL_SITE = 'https://inrut.ru';
//    const URL_SITE = 'http://192.168.0.102:6001';

//    useEffect(() => {
//       (async () => {
//          await Camera.requestCameraPermissionsAsync();
//          await Audio.requestPermissionsAsync();
//       })();
//    }, []);

//    useEffect(() => {
//       const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
//       const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
//       return () => {
//          showSub.remove();
//          hideSub.remove();
//       };
//    }, []);

//    // Динамически обновляем bottomInset при изменении окна
//    useEffect(() => {
//       const updateInset = () => {
//          setBottomInset(getBottomInset());
//       };
//       const dimSub = Dimensions.addEventListener('change', updateInset);
//       return () => dimSub?.remove?.();
//    }, []);

//    useEffect(() => {
//       (async () => {
//          const saved = await AsyncStorage.getItem('site_cookies');
//          if (saved) {
//             try {
//                const parsed = JSON.parse(saved);

//                // Берём домен из URL_SITE
//                const host = new URL(URL_SITE).hostname;

//                for (const [name, cookie] of Object.entries(parsed)) {
//                   await CookieManager.set(URL_SITE, {
//                      name,
//                      value: cookie.value,
//                      domain: cookie.domain ?? host,
//                      path: cookie.path ?? '/',
//                      secure: cookie.secure ?? true,
//                      httpOnly: cookie.httpOnly ?? false,
//                   });
//                }
//             } catch (e) {
//                console.warn('Ошибка восстановления куков:', e);
//             }
//          }
//       })();
//    }, []);

//    useEffect(() => {
//       if (Platform.OS === 'android') {
//          const backAction = () => {
//             if (canGoBack && webviewRef.current) {
//                webviewRef.current.goBack();
//                return true;
//             }
//             return false;
//          };
//          const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
//          return () => backHandler.remove();
//       }
//    }, [canGoBack]);

//    const observeCookiesJS = `
//     (function() {
//       let lastCookies = document.cookie;
//       setInterval(function() {
//         if (document.cookie !== lastCookies) {
//           lastCookies = document.cookie;
//           window.ReactNativeWebView.postMessage(JSON.stringify({cookies: document.cookie}));
//         }
//       }, 500);
//     })();
//     true;
//   `;

//    return (
//       <KeyboardAvoidingView
//          style={{
//             flex: 1,
//             paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
//             paddingBottom: keyboardOpen ? 0 : bottomInset,
//          }}
//          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}>
//          <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//          {loading && (
//             <View style={styles.splash}>
//                <ActivityIndicator size="large" color="#000" />
//             </View>
//          )}
//          <WebView
//             ref={webviewRef}
//             source={{ uri: `${URL_SITE}/chat` }}
//             injectedJavaScript={observeCookiesJS}
//             onMessage={async event => {
//                try {
//                   const data = JSON.parse(event.nativeEvent.data);
//                   if (data.cookies) {
//                      await AsyncStorage.setItem('site_cookies', JSON.stringify(await CookieManager.get(URL_SITE)));
//                   }
//                } catch {}
//             }}
//             onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
//             onLoadEnd={() => {
//                CookieManager.get(URL_SITE).then(async cookies => {
//                   await AsyncStorage.setItem('site_cookies', JSON.stringify(cookies));
//                });
//                setLoading(false);
//             }}
//             sharedCookiesEnabled
//             thirdPartyCookiesEnabled
//             javaScriptEnabled
//             domStorageEnabled
//             mediaPlaybackRequiresUserAction={false}
//             allowsInlineMediaPlayback
//             setSupportMultipleWindows={false}
//          />
//       </KeyboardAvoidingView>
//    );
// }

// const styles = StyleSheet.create({
//    splash: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1,
//    },
// });

// ============================================================================================================================================

// import React, { useRef, useState, useEffect } from 'react';
// import { Platform, View, BackHandler, StatusBar, StyleSheet, ActivityIndicator, Keyboard, KeyboardAvoidingView } from 'react-native';
// import { WebView } from 'react-native-webview';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import CookieManager from '@react-native-cookies/cookies';
// import { Camera } from 'expo-camera';
// import { Audio } from 'expo-av';
// import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// const URL_SITE = 'http://192.168.0.102:6001'; // ваш URL

// export default function App() {
//    return (
//       <SafeAreaProvider>
//          <InnerApp />
//       </SafeAreaProvider>
//    );
// }

// function InnerApp() {
//    const webviewRef = useRef(null);

//    const [canGoBack, setCanGoBack] = useState(false);
//    const [loading, setLoading] = useState(true);

//    useEffect(() => {
//       (async () => {
//          await Camera.requestCameraPermissionsAsync();
//          await Audio.requestPermissionsAsync();
//       })();
//    }, []);

//    useEffect(() => {
//       if (Platform.OS === 'android') {
//          const backAction = () => {
//             if (canGoBack && webviewRef.current) {
//                webviewRef.current.goBack();
//                return true;
//             }
//             return false;
//          };
//          const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
//          return () => backHandler.remove();
//       }
//    }, [canGoBack]);

//    useEffect(() => {
//       (async () => {
//          const saved = await AsyncStorage.getItem('site_cookies');
//          if (saved) {
//             try {
//                const parsed = JSON.parse(saved);
//                const host = new URL(URL_SITE).hostname;
//                for (const [name, cookie] of Object.entries(parsed)) {
//                   await CookieManager.set(URL_SITE, {
//                      name,
//                      value: cookie.value,
//                      domain: cookie.domain ?? host,
//                      path: cookie.path ?? '/',
//                      secure: cookie.secure ?? true,
//                      httpOnly: cookie.httpOnly ?? false,
//                   });
//                }
//             } catch (e) {
//                console.warn('Ошибка восстановления куков:', e);
//             }
//          }
//       })();
//    }, []);

//    const observeCookiesJS = `
//     (function() {
//       let lastCookies = document.cookie;
//       setInterval(function() {
//         if (document.cookie !== lastCookies) {
//           lastCookies = document.cookie;
//           window.ReactNativeWebView.postMessage(JSON.stringify({cookies: document.cookie}));
//         }
//       }, 500);
//     })();
//     true;
//   `;

//    return (
//       <KeyboardAvoidingView style={{ flex: 1 }}>
//          <SafeAreaView
//             style={{
//                flex: 1,
//             }}>
//             <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
//             {loading && (
//                <View style={styles.splash}>
//                   <ActivityIndicator size="large" color="#000" />
//                </View>
//             )}

//             <WebView
//                ref={webviewRef}
//                source={{ uri: `${URL_SITE}/chat` }}
//                injectedJavaScript={observeCookiesJS}
//                onMessage={async event => {
//                   try {
//                      const data = JSON.parse(event.nativeEvent.data);
//                      if (data.cookies) {
//                         const cookies = await CookieManager.get(URL_SITE);
//                         await AsyncStorage.setItem('site_cookies', JSON.stringify(cookies));
//                      }
//                   } catch {}
//                }}
//                onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
//                onLoadEnd={() => {
//                   CookieManager.get(URL_SITE).then(async cookies => {
//                      await AsyncStorage.setItem('site_cookies', JSON.stringify(cookies));
//                   });
//                   setLoading(false);
//                }}
//                sharedCookiesEnabled
//                thirdPartyCookiesEnabled
//                javaScriptEnabled
//                domStorageEnabled
//                mediaPlaybackRequiresUserAction={false}
//                allowsInlineMediaPlayback
//                setSupportMultipleWindows={false}
//             />
//          </SafeAreaView>
//       </KeyboardAvoidingView>
//    );
// }

// const styles = StyleSheet.create({
//    splash: {
//       position: 'absolute',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: '#fff',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1,
//    },
// });

// ============================================================================================================================================

import React, { useRef, useState, useEffect } from 'react';
import { Platform, View, BackHandler, StatusBar, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Keyboard } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-cookies/cookies';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// URL вашего сайта (оставьте как есть или поменяйте на нужный)
const URL_SITE = 'http://192.168.0.102:6001';

// Инжектируемый JS — он следит за фокусом input/textarea и за visualViewport.
// При появлении клавиатуры добавляется padding-bottom равный высоте ПОЯВИВШЕЙСЯ клавиатуры
// и фокусный элемент скроллится в центр видимой области.
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

   // Back button for Android
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

   // Restore cookies (ваш код)
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

   // ========== NEW: слушаем клавиатуру на RN-стороне ==========
   useEffect(() => {
      // keyboardDidShow — даёт координаты конечной области клавиатуры (endCoordinates.height)
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

   // Подбираем отступ снизу: учитываем safe area на iOS
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

            {/* Оборачиваем WebView в контейнер, у которого устанавливаем paddingBottom равный клавиатуре */}
            <View style={{ flex: 1, paddingBottom: bottomOffset, backgroundColor: '#fff' }}>
               <WebView
                  ref={webviewRef}
                  source={{ uri: `${URL_SITE}/chat` }}
                  injectedJavaScript={injectedJS}
                  onMessage={async event => {
                     try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (data && data.type === 'cookies') {
                           try {
                              const cookies = await CookieManager.get(URL_SITE);
                              await AsyncStorage.setItem('site_cookies', JSON.stringify(cookies));
                           } catch (e) {
                              console.warn('Ошибка сохранения куков:', e);
                           }
                        }
                     } catch (e) {
                        /* игнорируем не-JSON */
                     }
                  }}
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
                  javaScriptEnabled
                  domStorageEnabled
                  mediaPlaybackRequiresUserAction={false}
                  allowsInlineMediaPlayback
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
