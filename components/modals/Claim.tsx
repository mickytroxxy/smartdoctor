import React, { memo, useState } from 'react'
import { View, Text } from 'react-native'
import { useDispatch } from 'react-redux';
import CountrySelector from '../ui/CountrySelector';
import TextArea from '../ui/TextArea';
import { colors } from '@/constants/Colors';
import { LinearButton } from '../ui/Button';
import useLocation from '@/src/hooks/useLocation';
import { phoneNoValidation } from '@/src/helpers/methods';
import { setModalState } from '@/src/state/slices/modalState';
type PriceTypeProps = {
    attr:{
        handleAction:(...args:any) => void;
    }
}
const Claim = memo((props:PriceTypeProps) => {
    const {handleAction} = props.attr;
    const dispatch = useDispatch();
    const [value,setValue] = useState('');
    const {countryData} = useLocation()
    
    return (
        <View style={{padding:20}}>
            <Text style={{fontFamily:'fontLight'}}>To claim this order, you need to enter your phone number</Text>
            <View style={{marginTop:24}}>
                <CountrySelector type='Dropdown' />
                <TextArea attr={{field:'value',value:value,icon:{name:'phone',type:'FontAwesome',min:5,color:colors.primary},keyboardType:'number-pad',placeholder:'ENTER PHONENUMBER',color:'#009387',handleChange:(f:string,v:string) => setValue(v)}} />
            </View>
            <View style={{marginTop:24,zIndex:-1}}>
                <LinearButton 
                    btnInfo={{styles:{borderRadius:10,borderColor:colors.green,width:'100%'}}} 
                    textInfo={{text:'PROCEED',color:colors.green}} 
                    iconInfo={{type:'FontAwesome', name:'check-circle',color:colors.green,size:16}}
                    handleBtnClick={() => {
                        let v  = phoneNoValidation(value,countryData.dialCode);
                        handleAction(v)
                        dispatch(setModalState({isVisible:false}))
                    }}
                />
            </View>
        </View>
    )
})

export default Claim;