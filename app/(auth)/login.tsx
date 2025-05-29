import 'react-native-gesture-handler';
import { Dimensions, Image, Platform, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ThemedView } from '@/components/ThemedView';
import useAuth from '@/src/hooks/useAuth';
import { colors } from '@/constants/Colors';
import Icon from '@/components/ui/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import CountrySelector from '@/components/ui/CountrySelector';
import TextArea from '@/components/ui/TextArea';
import useLoader from '@/src/hooks/useLoader';
import { LinearButton } from '@/components/ui/Button';

export default function Login() {
  const [viewHeight, setViewHeight] = useState(500);
  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setViewHeight(height);
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
       <Stack.Screen options={{
          headerTitle:'Login'
        }} />
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#000', dark: '#000' }}
        headerImage={
          <LinearGradient
            onLayout={handleLayout}
            colors={[colors.tertiary, colors.tertiary, colors.green]}  
            style={{flex:1}}
          >
            <View style={{flex:1,alignItems:'center',justifyContent:'center',gap:10}}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={{width:180,height:180,borderRadius:50}}
                resizeMode="contain"
              />
              <Text style={{fontFamily:'fontBold',color:colors.white}}>Your health, our priority, get connected now</Text>
            </View>
          </LinearGradient>
        }
        headerHeight={viewHeight}
      >
        <BodySection/>
      </ParallaxScrollView>
    </ThemedView>
  );
}
const BodySection = () => {
  const { formData, handleChange, login } = useAuth();
  const { updateLoadingState } = useLoader();

  const handleTextChange = (field: string, value: string) => {
    handleChange(field, value);
  };

  const handleLogin = async () => {
    try {
      updateLoadingState(true, 'Logging you in...');
      await login();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      updateLoadingState(false, '');
    }
  };
  return (
    <View style={{flex:1}}>
      <View style={{alignItems:'center',marginTop:-15}}><Icon name="ellipsis-horizontal" color={colors.grey} type="Ionicons" size={30} /></View>
      
      <CountrySelector/>
      <TextArea 
        attr={{
          placeholder: 'Phone Number',
          value: formData.phoneNumber,
          field: 'phoneNumber',
          handleChange: handleTextChange,
          keyboardType: 'phone-pad',
          icon: {
            name: 'phone',
            type: 'FontAwesome',
            color: colors.grey,
            size: 20
          },
        }}
      />
      
      <TextArea 
        attr={{
          placeholder: 'Password',
          value: formData.password,
          field: 'password',
          handleChange: handleTextChange,
          icon: {
            name: 'lock',
            type: 'FontAwesome',
            color: colors.grey,
            size: 20
          },
        }}
      />

      <View style={{flex: 1,marginTop:30, gap:12}}>
          <LinearButton 
            textInfo={{ text: `Log In`, color: colors.primary }} 
            iconInfo = {{ name: 'log-in', type: 'Feather', color: colors.primary, size: 20 }} 
            handleBtnClick = {() => handleLogin()}
          />
          <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 20,
            }}>
              <Text style={{
                  fontFamily: 'fontLight',
                  color: colors.grey,
                  fontSize: 14,
                }}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={{
                  fontFamily: 'fontBold',
                  color: colors.primary,
                  marginLeft: 5,
                  fontSize: 14,
                }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
      </View>
    </View>
  );
}
