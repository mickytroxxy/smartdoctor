import React, {useContext,useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import { useDispatch } from 'react-redux';
import { setModalState } from '@/src/state/slices/modalState';
interface DateTimeSelectorProps {
    attr:{
        handleChange:(field:any,value:any) => void;
        field?:string;
        headerText?:string;
    }
}
export default function DateTimeSelector(props:DateTimeSelectorProps) {
    const [value, setValue] = useState(new Date(Date.now()));
    const dispatch = useDispatch();
    const confirmSelection = () =>{
        props.attr.handleChange([props.attr.field],value)
        dispatch(setModalState({isVisible:false}))
    }
    return (
        <ScrollView>
            <View style={{padding:10,flex:1,alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                <DateTimePicker
                    value={value}
                    mode={props.attr.headerText === 'SELECT DATE' ? 'date' : 'time'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={(event:any, value:any) => setValue(value)}
                    style={styles.datePicker}
                />
                <View style={{alignItems:'center',marginTop:30}}>
                    <TouchableOpacity onPress={confirmSelection}>
                        <FontAwesome name='check-circle' size={120} color="green"></FontAwesome>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 320,
    height: 260,
    display: 'flex',
  },
});
