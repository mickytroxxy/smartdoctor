import 'react-native-gesture-handler';
import React, { memo } from "react";
import { StyleSheet, ScrollView, Text, View, Modal, KeyboardAvoidingView , TouchableOpacity} from "react-native";
import CountryList from '../modals/CountryList';
import { useDispatch, useSelector } from 'react-redux';
import Icon from './Icon';
import Location from './Location';
import Input from '../modals/Input';
import DateTimeSelector from '../modals/DateTimeSelector';
import Selector from '../modals/Selector';
import SuccessStatus from '../modals/SuccessStatus';
import TextArea from './TextArea';
import { colors } from '../../constants/Colors';
import { RootState } from '@/src/state/store';
import { setModalState } from '@/src/state/slices/modalState';
import Fees from '../modals/Fees';
import TopUp from '../modals/TopUp';
import Withdraw from '../modals/Withdraw';
import Claim from '../modals/Claim';

const COMPONENT_MAP: { [key: string]: any } = {
    'SELECT_COUNTRY': CountryList,
    'SELECT_LOCATION': Location,
    'TOP_UP_BALANCE': TopUp,
    'WITHDRAW_FUNDS': Withdraw,
    'REPORT_POST': Input,
    'SERVICE_NAME': Input,
    'CREATE_TOKEN': TopUp,
    'SELECT_DATE': DateTimeSelector,
    'SELECT_TIME': DateTimeSelector,
    'SELECT_GENDER': Selector,
    'CLAIM_ORDER': Claim,
    'SUCCESS_STATUS': SuccessStatus,
    'ENTER_AMOUNT': Input,
    'SETUP_YOUR_FEES': Fees
};
const ModalController = memo(() =>{
    const modalState = useSelector((state: RootState) => state.modalState);
    const dispach = useDispatch();
    const {isVisible, attr} = modalState;
    const {headerText} = attr;

    const SelectedComponent = COMPONENT_MAP[headerText?.split(" ").join("_")];

    return(
        <View>
            <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={() => dispach(setModalState({isVisible:false}))}>
                <View style={{flex:1,backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <View style={styles.centeredView}>
                        <View style={styles.ProfileFooterHeader}>
                            <View style={{alignContent:'center',alignItems:'center',marginTop:-10}}>
                                <Icon type='FontAwesome' name="ellipsis-h" color="#5586cc" size={36} />
                            </View>
                            <TouchableOpacity onPress={() =>  dispach(setModalState({isVisible:false})) } style={styles.statsContainer}>
                                <Icon type='Feather' name="arrow-left-circle" color="#757575" size={24}/>
                                <Text style={{textTransform:'uppercase',fontSize:12,fontFamily:'fontBold',color:'#5586cc',marginLeft:10,marginTop:6}}>{headerText}</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} style={{marginTop:5}}>
                            <KeyboardAvoidingView behavior="padding" enabled>
                                {SelectedComponent && <SelectedComponent attr={attr}/>}
                            </KeyboardAvoidingView>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    )
})
export default ModalController;
const styles = StyleSheet.create({
    statsContainer: {
        flexDirection: "row",
        alignSelf: "center",
        marginTop: -5,
        justifyContent:'center',
        padding:5,
    },
    ProfileFooterHeader:{
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        borderBottomWidth:1,
        borderColor:'#D2D6D8',
        height:70
    },
    centeredView:{
        minHeight:'60%',
        maxHeight:'90%',
        marginTop: 'auto',
        backgroundColor:'#fff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        marginLeft:2,marginRight:2
    },
});