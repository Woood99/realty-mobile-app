import { useRef, useState, useEffect } from 'react';
import { View, BackHandler, Platform, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
   const webviewRef = useRef(null);
   const [canGoBack, setCanGoBack] = useState(false);

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

   return (
      <View style={{ flex: 1 }}>
         <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
         <WebView
            ref={webviewRef}
            source={{ uri: 'https://inrut.ru/chat' }}
            onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
            onShouldStartLoadWithRequest={() => true}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            style={{ marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}
         />
      </View>
   );
}
