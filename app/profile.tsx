import 'react-native-gesture-handler';
import { Dimensions, Platform, TouchableOpacity, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Stack } from 'expo-router';
import { useState } from 'react';
import BodySection from '@/components/profile/BodySection';
import HeaderSection from '@/components/profile/HeaderSection';
import { ThemedView } from '@/components/ThemedView';
import useAuth from '@/src/hooks/useAuth';
import { colors } from '@/constants/Colors';
import Icon from '@/components/ui/Icon';

const getHeight = () => {
  const { height } = Dimensions.get('screen');
  if(height < 740){
    return 525
  }else{
    if(Platform.OS === 'android'){
      return 400
    }else{
      return 600
    }
  }
}

export default function ProfileScreen() {
  const [viewHeight, setViewHeight] = useState(getHeight());
  const {profileOwner, logOut} = useAuth();

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setViewHeight(height);
    }
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: colors.green }}>
       <Stack.Screen options={{
          headerShown:true,
          headerRight: () => (profileOwner ? <TouchableOpacity onPress={logOut} style={{}}><Icon type="FontAwesome" name="sign-out" size={40} color={colors.tomato} /></TouchableOpacity> : null)
        }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: colors.green, dark: colors.green }}
        headerImage={
          <View onLayout={handleLayout} style={{ flex: 1, backgroundColor: colors.green }}>
            <HeaderSection />
          </View>
        }
        headerHeight={viewHeight}
      >
        <BodySection />
      </ParallaxScrollView>
    </ThemedView>
  );
}


