import { colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const ProfileBtn = ({headerText,subText,onPress}:{headerText:string,subText:string,onPress:() => void}) => {
    return(
        <Animatable.View
            animation="fadeInRight"
            duration={1000}
            style={styles.sectionContainer}
        >
            <View style={styles.sectionContent}>
            <TouchableOpacity
                onPress={() => onPress()}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={[colors.tertiary, colors.green]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.becomeDoctorGradient}
                >
                    <View style={styles.becomeDoctorContent}>
                        <View style={styles.becomeDoctorTextContainer}>
                        <Text style={styles.becomeDoctorTitle}>{headerText}</Text>
                        <Text style={styles.becomeDoctorSubtitle}>{subText}</Text>
                        </View>
                        <View style={styles.becomeDoctorIconContainer}>
                            <Ionicons name="medical" size={40} color="rgba(255,255,255,0.3)" />
                        </View>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
            </View>
        </Animatable.View>
    )
}


const styles = StyleSheet.create({
    sectionContainer: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'fontBold',
      color: colors.white,
      marginBottom: 15,
    },
    sectionContent: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    becomeDoctorGradient: {
      padding: 20,
      borderRadius:10
    },
    becomeDoctorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    becomeDoctorTextContainer: {
      flex: 1,
    },
    becomeDoctorTitle: {
      fontSize: 20,
      fontFamily: 'fontBold',
      color: colors.white,
      marginBottom: 8,
    },
    becomeDoctorSubtitle: {
      fontSize: 14,
      fontFamily: 'fontLight',
      color: 'rgba(255, 255, 255, 0.8)',
      lineHeight: 20,
    },
    becomeDoctorIconContainer: {
      marginLeft: 20,
    },
});