import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { PersistGate } from 'redux-persist/integration/react';
import { persistor, RootState, store } from '@/src/state/store';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {Image, View } from 'react-native';
import { colors } from '@/constants/Colors';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ModalController from '@/components/ui/modal';
import Loader from '@/components/ui/Loader';
import { useOnesignal } from '@/src/hooks/useOnesignal';
import { getSecretKeys } from '@/src/helpers/api';
import { setSecrets } from '@/src/state/slices/globalVariables';
import useAuth from '@/src/hooks/useAuth';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    fontLight: require('../assets/fonts/MontserratAlternates-Light.otf'),
    fontBold: require('../assets/fonts/MontserratAlternates-Bold.otf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{flex:1, backgroundColor: colors.green}}>
      <ThemeProvider value={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.green,
          card: colors.green,
          primary: colors.primary,
        }
      }}>
      <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
          <Main />
        </Provider>
        <StatusBar style='light' backgroundColor={colors.green} />
      </PersistGate>
    </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const Main = () => {
  const {} = useOnesignal();
  const {getUserDetails} = useAuth();
  const { isFetching } = useSelector((state: RootState) => state.modalState);
  const dispatch = useDispatch()

  useEffect(() => {
      (async() =>{
          const secrets = await getSecretKeys();
          if(secrets?.length > 0){
            dispatch(setSecrets(secrets[0]))
          }
      })()
  },[])

  useEffect(() => {
    getUserDetails();
  },[])
  return (
    <View style={{flex:1, backgroundColor: colors.green}}>
      <ConfirmDialog/>
      <Stack
        screenOptions={{
          headerStyle: {backgroundColor: colors?.green},
          headerTintColor: "#fff",
          headerTitleStyle: {fontFamily:'fontBold',fontSize:16},
          headerTitle: () => <Image source={require('@/assets/images/smarttext.png')} style={{height:60,width:160,marginLeft:10}} resizeMode='contain' />,
          contentStyle: { backgroundColor: colors.green },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: true }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {isFetching.state && <Loader text={isFetching.text}/>}
      <ModalController/>
    </View>
  );
}
