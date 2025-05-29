import React, { memo, useState } from 'react';
import { TouchableOpacity, Text, View, Platform, StyleSheet} from 'react-native';
import Icon from './Icon';
import { AddressButtonProps, ButtonProps, DateButtonProps, IconButtonProps, LocationType } from '../../constants/Types';
import { useDispatch } from 'react-redux';
import { colors } from '../../constants/Colors';
import moment from 'moment';
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { setModalState } from '@/src/state/slices/modalState';
import { useSecrets } from '@/src/hooks/useSecrets';
import TextArea from './TextArea';
import useLocation from '@/src/hooks/useLocation';

export const Button: React.FC<ButtonProps> = memo((props) => {
  const { btnInfo, textInfo, iconInfo, handleBtnClick } = props;

  return (
    <TouchableOpacity onPress={handleBtnClick} style={[{ borderRadius: 5, padding: 15, borderColor: '#14678B', borderWidth: 0.7, flexDirection: 'row', width: '100%', marginTop: 10 }, btnInfo?.styles]}>
      <Icon type={iconInfo.type} name={iconInfo.name} size={iconInfo.size} color={iconInfo.color} />
      <View style={{ marginLeft: 5, justifyContent: 'center' }}>
        <Text style={{ fontFamily: 'fontBold', color: textInfo?.color, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{textInfo?.text}</Text>
      </View>
    </TouchableOpacity>
  );
});

export const LinearButton: React.FC<ButtonProps> = memo((props) => {
  const { btnInfo, textInfo, iconInfo, handleBtnClick } = props;

  return (
    <LinearGradient colors={["#e44528","#63acfa","#f3bf4f"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{padding:1.2,borderRadius:10}}>  
      <TouchableOpacity onPress={handleBtnClick} style={{alignItems:'center',justifyContent:'center',backgroundColor:'#fff',borderRadius:10,display:'flex',flexDirection:'row',paddingVertical:16,paddingHorizontal:30}}>
        <Text style={{ fontFamily: 'fontBold', color: textInfo?.color, fontSize: 11, textAlign: 'center' }} numberOfLines={1}>{textInfo?.text } </Text>
         <Icon type={iconInfo.type} name={iconInfo.name} size={iconInfo.size} color={iconInfo.color} />
      </TouchableOpacity>
    </LinearGradient>
  );
});


export const IconButton: React.FC<IconButtonProps> = memo((props) => {
  const { iconInfo, handleBtnClick } = props;

  return (
    <TouchableOpacity onPress={handleBtnClick}>
      <Icon type={iconInfo.type} name={iconInfo.name} size={iconInfo.size} color={iconInfo.color} />
    </TouchableOpacity>
  );
});

export const AddressButton: React.FC<AddressButtonProps> = memo((props) => {
  const dispatch = useDispatch();
  const {secrets} = useSecrets();
  const {location} = useLocation();
  const [searchLocation,setSearchLocation] = useState<LocationType>();
  const [value,setValue] = useState('');  
  const handleChange = (field:string,value:LocationType) => {
    setSearchLocation(value)
    props.handleBtnClick(value);
  };

  if(secrets?.googleApiKeyActive){
    return(
      <View style={{marginTop:10}}>
        <TouchableOpacity onPress={() => {
          dispatch(setModalState({isVisible:true,attr:{headerText:'SELECT LOCATION',placeHolder:'Give Us A Location',field:'meetUpLocation',cb:handleChange}}))
        }} style={{backgroundColor : "#fff",width:'100%',borderRadius:10,padding:15,borderColor:colors.grey,borderWidth:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
          <Icon type="Feather" name="map-pin" color={colors.grey} size={24} />
          <Text style={{fontFamily:'fontLight',color:colors.grey,fontSize:13,flex:1,marginLeft:5}}>{!searchLocation ? (props.placeholder ? props.placeholder : 'Give Us A Location') : searchLocation.text} </Text>
        </TouchableOpacity>
      </View>
    )
  }else{
    return(
      <TextArea
        attr={{
            placeholder: "Type in the address",
            value: value,
            field: 'address',
            handleChange:(field:string,value:string) => {
              setValue(value);
              props.handleBtnClick({text:value,latitude:location.latitude,longitude:location.longitude})
            },
            icon: {
                name: 'map-pin',
                type: 'Feather',
                color: colors.grey
            }
        }}
    />
    )
  }
})


export const DatePickerButton: React.FC<DateButtonProps> = memo((props) => {
  const dispatch = useDispatch();
  const [isAndroid,setIsAndroid] = useState(false);
  const [time,setTime] = useState<any>(new Date(Date.now()));
  const handleChange = (field:string,value:string) => {
    setTime(value)
    props.handleBtnClick(value);
  };
  const showModal = () => {
    if(Platform.OS === 'android'){
      setIsAndroid(true)
    }else{
      dispatch(setModalState({isVisible:true,attr:{headerText:'SELECT DATE',field:'meetUpLocation',handleChange}}))
    }
  }
  return(
    <View>
      {props?.placeholder === 'DATE OF BIRTH' ? 
        <TouchableOpacity onPress={showModal}><Icon type='FontAwesome'  name="edit" color="#c5c3c8" size={24} /></TouchableOpacity>
        :
        <TouchableOpacity onPress={showModal} style={{backgroundColor : "#fff",width:'100%',borderRadius:10,padding:15,borderColor:'#a8a6a5',borderWidth:0.5,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
          <Icon type="MaterialIcons" name="date-range" color={colors.header} size={24} />
          <Text style={{fontFamily:'fontLight',color:colors.grey,fontSize:13,flex:1,marginLeft:5}}>{!time ? (props.placeholder ? props.placeholder : 'Select '+ props.mode) : moment(time).format(props?.mode === 'date' ? 'L' : 'HH:mm')} </Text>
        </TouchableOpacity>
      }
      {(Platform.OS === 'android' && isAndroid) &&
        <DateTimePicker
          value={time}
          mode={props.mode}
          display={'default'}
          is24Hour={true}
          onChange={(event:any, value:any) => {
            setIsAndroid(false);
            setTimeout(() => {
              handleChange('date',value);
            }, 1000);
          }}
          style={styles.datePicker}
        />
      }
    </View>
  )
})

const styles = StyleSheet.create({
  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 320,
    height: 260,
    display: 'flex',
  },
});