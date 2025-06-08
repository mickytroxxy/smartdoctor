import { colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import { View, Text, ActivityIndicator, TextInput, ScrollView, Image } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import useHome from "@/src/hooks/useHome";
import useDoctor from "@/src/hooks/useDoctor";
import useStats from "@/src/hooks/useStats";
import { DoctorSpecialty, PlayMyJamProfile } from "@/constants/Types";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import * as Animatable from 'react-native-animatable';
import { homeStyles as styles } from "./styles";
import { currencyFormatter } from "@/src/helpers/methods";
import { TouchableOpacity } from "react-native-gesture-handler";
import { setActiveUser } from "@/src/state/slices/accountInfo";
import { useDispatch } from "react-redux";
import useMessageList from "@/src/hooks/useMessageList";

// Define doctor specialties array since DoctorSpecialty is a type, not a value
const DOCTOR_SPECIALTIES: DoctorSpecialty[] = [
  'General Practitioner',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Psychiatrist',
  'Orthopedic',
  'Gynecologist',
  'Ophthalmologist',
  'Dentist',
  'AI Doctor'
];

// Stats Card Component
const StatsCard = ({
  icon,
  title,
  value,
  color,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  delay: number;
}) => {
  return (
    <Animatable.View
      animation="fadeInRight"
      delay={delay}
      style={[styles.statsCard, { backgroundColor: color}]}
    >
      <View style={styles.statsIconContainer}>
        {icon}
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </Animatable.View>
  );
};

// Doctor Card Component with inline styles
const DoctorCard = ({
  doctor,
  onPress,
  index
}: {
  doctor: PlayMyJamProfile;
  onPress: () => void;
  index: number;
}) => {
  // Calculate animation delay based on index
  const animationDelay = 300 + (index * 100);
  const { handleChatWithDoctor } = useDoctor(doctor.userId || '');

  return (
    <Animatable.View
      animation="fadeInLeft"
      delay={animationDelay}
      duration={500}
      style={{
        width: '90%',
        marginBottom: 16,
        marginHorizontal: '5%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={{
          backgroundColor: colors.tertiary + 30,
          borderRadius: 10,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: colors.transparent,
        }}
      >
        <LinearGradient
          colors={[colors.tertiary, colors.green]} // Constant gradient colors
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height: 8,
            width: '100%',
          }}
        />

        <View style={{
          padding: 16,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 16,
              borderWidth: 2,
              borderColor: '#4568dc',
              overflow: 'hidden',
            }}>
              {doctor.avatar ? (
                <Image
                  source={{ uri: doctor.avatar }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 30,
                  }}
                  resizeMode="cover"
                />
              ) : doctor.isAI ? (
                // Dummy avatar for AI doctors
                <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#8a2be2',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 30,
                }}>
                  <Ionicons name="medkit" size={30} color="#fff" />
                </View>
              ) : (
                // Fallback to initials for doctors without avatar
                <Text style={{
                  fontSize: 14,
                  fontFamily: 'fontBold',
                  color: colors.white,
                }}>
                  {doctor.fname?.charAt(0) || 'D'}
                </Text>
              )}
            </View>

            <View style={{
              flex: 1,
            }}>
              <Text style={{
                fontSize: 14,
                fontFamily: 'fontBold',
                color: colors.white,
                marginBottom: 4,
              }}>
                {doctor.fname}
              </Text>

              <Text style={{
                fontSize: 14,
                fontFamily: 'fontLight',
                color: colors.white,
                marginBottom: 4,
              }}>
                {doctor.specialty}
              </Text>

              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesome
                    key={star}
                    name={
                      doctor?.ratings && doctor.ratings.length > 0
                        ? (doctor.ratings.reduce((acc, curr) => acc + curr.rating, 0) / doctor.ratings.length) >= star
                          ? "star" : "star-o"
                        : "star-o"
                    }
                    size={14}
                    color="#FFD700"
                    style={{ marginRight: 2 }}
                  />
                ))}
                <Text style={{
                  fontSize: 12,
                  fontFamily: 'fontLight',
                  color: colors.grey,
                  marginLeft: 4,
                }}>
                  {doctor?.ratings && doctor.ratings.length > 0
                    ? (doctor.ratings.reduce((acc, curr) => acc + curr.rating, 0) / doctor.ratings.length).toFixed(1)
                    : "0.0"} ({doctor?.ratings?.length || 0})
                </Text>
              </View>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 16,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 18,
                fontFamily: 'fontBold',
                color: colors.white,
                marginRight: 8,
              }}>
                {currencyFormatter(doctor.fees || 0)}
              </Text>

              {doctor.supportsHomeVisit && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#e8f4f8',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                  <Ionicons name="home" size={12} color="#4568dc" />
                  <Text style={{
                    fontSize: 10,
                    fontFamily: 'fontLight',
                    color: '#4568dc',
                    marginLeft: 4,
                  }}>
                    Home Visit
                  </Text>
                </View>
              )}

              {doctor.isAI && (
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f0e6ff',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 4,
                }}>
                  <Ionicons name="medkit" size={12} color="#8a2be2" />
                  <Text style={{
                    fontSize: 10,
                    fontFamily: 'fontLight',
                    color: '#8a2be2',
                    marginLeft: 4,
                  }}>
                    AI Assistant
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: colors.green,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 6,
              }}
              onPress={onPress}
            >
              <Text style={{
                color: colors.white,
                fontFamily: 'fontBold',
                fontSize: 14,
              }}>
                Consult
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { chatPreviews } = useMessageList();
  const dispatch = useDispatch();
  const {
    doctors,
    loading,
    searchQuery,
    setSearchQuery,
    handleSelectDoctor,
    handleSpecialtyFilter,
    filters,
    accountInfo
  } = useHome();

  // Get live stats data
  const {
    totalAppointments,
    totalConsultations,
    totalPrescriptions,
    loading: statsLoading,
    error: statsError
  } = useStats();

  // Live stats data
  const stats = [
    {
      title: "Appointments",
      value: statsLoading ? "..." : totalAppointments.toString(),
      icon: <FontAwesome5 name="calendar-check" size={24} color="#fff" />,
      color: colors.green + 30
    },
    {
      title: "Consultations",
      value: statsLoading ? "..." : totalConsultations.toString(),
      icon: <MaterialCommunityIcons name="video-account" size={24} color="#fff" />,
      color: colors.green + 30
    },
    {
      title: "Prescriptions",
      value: statsLoading ? "..." : totalPrescriptions.toString(),
      icon: <FontAwesome5 name="prescription-bottle-alt" size={24} color="#fff" />,
      color: colors.green + 30
    }
  ];

  return (
    <LinearGradient
      colors={[colors.tertiary, colors.tertiary, colors.green]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerRight: () => (
            <View style={styles.headerButtonsContainer}>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() => router.push('/messages')}
              >
                <Ionicons name="chatbubbles" size={28} color={colors.white} />
                {chatPreviews.length > 0 && (
                  <View style={styles.messageBadge}>
                    <Text style={styles.messageBadgeText}>
                      {chatPreviews.length > 9 ? '9+' : chatPreviews.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileButton}
                onPress={() => {
                  if(accountInfo){
                    dispatch(setActiveUser(accountInfo))
                    router.push('/profile');
                  }
                }}
              >
                <Ionicons name="person-circle" size={36} color={colors.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Welcome Section */}
          <Animatable.View
            //animation="fadeIn"
            duration={800}
            style={styles.welcomeSection}
          >
            <Text style={styles.welcomeText}>
              Hello, {accountInfo?.fname || 'Patient'}
            </Text>
            <Text style={styles.welcomeSubtext}>
              How are you feeling today?
            </Text>
          </Animatable.View>

          {/* Search Bar */}
          <Animatable.View
            //animation="fadeInUp"
            duration={800}
            delay={200}
            style={styles.searchContainer}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.grey}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, specialties..."
              placeholderTextColor={colors.grey}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Animatable.View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Animatable.Text
              //animation="fadeInLeft"
              duration={800}
              style={styles.sectionTitle}
            >
              Your Health Stats
            </Animatable.Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.statsScrollContent}
            >
              {stats.map((stat, index) => (
                <StatsCard
                  key={stat.title}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  color={stat.color}
                  delay={300 + (index * 100)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Specialty Filter */}
          <View style={styles.specialtySection}>
            <Animatable.Text
              animation="fadeInLeft"
              duration={800}
              delay={400}
              style={styles.sectionTitle}
            >
              Specialties
            </Animatable.Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.specialtyFilterContainer}
            >
              <Animatable.View
                animation="fadeInRight"
                duration={500}
                delay={500}
              >
                <TouchableOpacity
                  style={[
                    styles.specialtyItem,
                    !filters.specialty ? styles.specialtyItemSelected : null,
                  ]}
                  onPress={() => handleSpecialtyFilter(null)}
                >
                  <Text
                    style={[
                      styles.specialtyText,
                      !filters.specialty ? styles.specialtyTextSelected : null,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
              </Animatable.View>

              {DOCTOR_SPECIALTIES.map((specialty, index) => (
                <Animatable.View
                  key={specialty}
                  //animation="fadeInRight"
                  duration={500}
                  delay={500 + ((index + 1) * 100)}
                >
                  <TouchableOpacity
                    style={[
                      styles.specialtyItem,
                      filters.specialty === specialty ? styles.specialtyItemSelected : null,
                    ]}
                    onPress={() => handleSpecialtyFilter(specialty)}
                  >
                    <Text
                      style={[
                        styles.specialtyText,
                        filters.specialty === specialty ? styles.specialtyTextSelected : null,
                      ]}
                    >
                      {specialty}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </ScrollView>
          </View>

          {/* Doctors Section */}
          <View style={styles.doctorsSection}>
            <Animatable.Text
              //animation="fadeInLeft"
              duration={800}
              delay={600}
              style={[styles.sectionTitle,{marginLeft:20}]}
            >
              Top Doctors
            </Animatable.Text>

            {(loading && doctors.length === 0) ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.white} />
              </View>
            ) : doctors.length === 0 ? (
              <Animatable.View
                animation="fadeIn"
                duration={800}
                delay={700}
                style={styles.emptyContainer}
              >
                <Ionicons name="medical" size={48} color={colors.white} />
                <Text style={styles.emptyText}>No doctors found</Text>
              </Animatable.View>
            ) : (
              <View style={styles.doctorsContainer}>
                {doctors.map((doctor, index) => (
                  <DoctorCard
                    key={doctor.userId || index.toString()}
                    doctor={doctor}
                    onPress={() => handleSelectDoctor(doctor)}
                    index={index}
                  />
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}