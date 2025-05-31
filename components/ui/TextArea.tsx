import React, { memo, useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Col, Grid } from 'react-native-easy-grid';
import Icon from './Icon';
import { TextAreaProps } from '../../constants/Types';
import { colors } from '../../constants/Colors';


const TextArea: React.FC<TextAreaProps> = memo((props) => {
  const [showPassword, setShowPassword] = useState(true);
  const [value, setValue] = useState('');
  const { attr, style } = props;
  useEffect(() => {
    setValue(attr?.value || '')
  },[attr])
  return (
    <View style={[{ marginTop: 10, height:attr.multiline ? 120 : 55, backgroundColor:colors.white,borderRadius:attr.borderRadius || 10 }, style]}>
      <View style={[styles.searchInputHolder,{height:attr.multiline ? 120 : 55,borderRadius:attr.borderRadius || 10}]}>
        <View style={{ justifyContent: 'center', alignItems: 'center',marginLeft:10 }}>
          {attr.icon && <Icon name={attr.icon.name} type={attr.icon.type} color={attr.icon.color} size={24} />}
        </View>
        <View style={{ justifyContent: 'center',marginLeft:5, flex:1 }}>
          <TextInput
            placeholder={attr.placeholder}
            autoCapitalize="none"
            multiline={attr.multiline}
            maxLength={1200}
            numberOfLines={attr.multiline ? 10 : 1}
            keyboardType={attr.keyboardType || undefined}
            editable={attr.editable !== undefined ? attr.editable : true}
            onChangeText={(val) => {
              setValue(val);
              attr.handleChange(attr.field, val);
            }}
            onFocus={() => attr?.onFocus && attr?.onFocus()}
            value={value}
            secureTextEntry={attr.field === 'password' ? showPassword : false}
            style={{ borderColor: '#fff', fontFamily: 'fontLight', fontSize: 14, color: '#757575',marginLeft:2 }}
          />
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          {attr.field === 'password' ? (
            <TouchableOpacity style={{marginRight:12}} onPress={() => setShowPassword(!showPassword)}>
              {!showPassword ? <Icon name="eye-off" type="Feather" color="grey" size={24} /> : <Icon name="eye" type="Feather" color="grey" size={20} />}
            </TouchableOpacity>
          ) : (
            <View>
              {attr.isSendInput ?
                <View>
                  {value.length > 1 && (
                    <Animatable.View animation="bounceIn">
                      <TouchableOpacity onPress={() => {
                        attr?.onSendClicked && attr.onSendClicked();
                      }}>
                        <Icon name="send" type="Feather" color="green" size={20} />
                      </TouchableOpacity>
                    </Animatable.View>
                  )}
                </View> :

                <View>

                </View>
              }
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  searchInputHolder: {
    borderRadius: 10,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#a8a6a5',
    width: '100%',
  },
});

export default TextArea;
