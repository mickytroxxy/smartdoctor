import React, { memo, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SvgUri } from 'react-native-svg';
import { countries } from '../../constants/countries';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/Colors';
import CountryList from '../modals/CountryList';
import useLocation from '@/src/hooks/useLocation';
import { setCountryData } from '@/src/state/slices/location';
const CountrySelector = memo(({type}:{type?:'Modal' | 'Dropdown'}) => {
    const {locationWithText, countryData} = useLocation();
    const router = useRouter();
    const dispatch = useDispatch();
    const [isCollapsed,setIsCollapsed] = useState(false)
    React.useEffect(()=>{
        const {short_name,long_name} = locationWithText;
        if(short_name && long_name){
            dispatch(setCountryData(countries.filter(country => country.name === long_name || country.isoCode === short_name)[0]))
        }
    },[])
    return (
        <View>
            <TouchableOpacity onPress={()=>{
                if(!type){
                    router.push({pathname:'/modal',params:{headerText:'SELECT COUNTRY'}})
                }else{
                    setIsCollapsed(!isCollapsed)
                }
            }} style={{padding:18,borderRadius:10,flexDirection:'row',borderColor:'#a8a6a5',borderWidth:1,backgroundColor:colors.white}}>
                <SvgUri
                    width={20}
                    height={18}
                    uri={countryData?.flag}
                />
                <Text style={{flex:1,marginLeft:10,fontFamily:'fontBold',bottom:2}}>{countryData?.dialCode}</Text>
                <Text style={{fontFamily:'fontLight',bottom:2}}>{countryData?.name.slice(0,36)}</Text>
            </TouchableOpacity>
            {isCollapsed && <CountryList setIsCollapsed={setIsCollapsed} />}
        </View>
    )
})


export default CountrySelector