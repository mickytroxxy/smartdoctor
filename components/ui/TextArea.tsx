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
  }, [attr])

  const containerHeight = attr.multiline ? 120 : 55;

  return (
    <View style={[styles.container, { height: containerHeight }, style]}>
      <View style={[styles.searchInputHolder, { height: containerHeight }]}>
        {attr.icon && (
          <View style={styles.iconContainer}>
            <Icon name={attr.icon.name} type={attr.icon.type} color={attr.icon.color} size={24} />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            placeholder={attr.placeholder}
            placeholderTextColor="#999"
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
            style={[
              styles.textInput,
              attr.multiline && styles.multilineInput
            ]}
            textAlignVertical={attr.multiline ? 'top' : 'center'}
          />
        </View>
        <View style={styles.rightContainer}>
          {attr.field === 'password' ? (
            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon
                name={!showPassword ? "eye-off" : "eye"}
                type="Feather"
                color="grey"
                size={20}
              />
            </TouchableOpacity>
          ) : attr.isSendInput ? (
            <View style={styles.sendContainer}>
              {value.length > 1 && (
                <Animatable.View animation="bounceIn">
                  <TouchableOpacity
                    onPress={() => attr?.onSendClicked && attr.onSendClicked()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon name="send" type="Feather" color="green" size={20} />
                  </TouchableOpacity>
                </Animatable.View>
              )}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  searchInputHolder: {
    borderRadius: 10,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: '#a8a6a5',
    width: '100%',
    backgroundColor: colors.white,
    alignItems: 'stretch',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 5,
    minWidth: 40,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 5,
  },
  textInput: {
    fontFamily: 'fontLight',
    fontSize: 14,
    color: '#333',
    paddingHorizontal: 5,
    paddingVertical: 8,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 12,
    minWidth: 40,
  },
  passwordToggle: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TextArea;
