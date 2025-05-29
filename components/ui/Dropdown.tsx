import { colors } from "@/constants/Colors";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Icon from "./Icon";
import TextArea from "./TextArea";

export type ItemListType = {
    id: any;
    label: string;
    selected: boolean;
    subtitle?:any;
    other?:any,
    interest?:number,
    image?:string
};

export type DropdownTypes = {
    onChange: (item: ItemListType) => void; 
    itemList: ItemListType[];
    placeholder: string;
    subtitle?:string;
    isSearch?:boolean
};

export const Dropdown = ({ onChange, itemList, placeholder, isSearch }: DropdownTypes) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const selectedOption = itemList?.find(item => item.selected);
    const [searchValue,setSearchValue] = useState('');
    return (
        <View>
            <TouchableOpacity
                onPress={() => setIsCollapsed(!isCollapsed)}
                style={{
                    borderRadius: 10,
                    flexDirection: 'row',
                    borderWidth: isCollapsed ? 2 : 1,
                    padding: 10,
                    borderColor: isCollapsed ? colors.primary : colors.grey,
                    borderBottomLeftRadius: isCollapsed ? 0 : 10,
                    borderBottomRightRadius: isCollapsed ? 0 : 10,
                    height: 60,
                    zIndex: 10,
                    backgroundColor:colors.white
                }}
            >
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: 'fontBold', fontSize: 12 }}>
                        {isCollapsed ?
                            placeholder :
                            selectedOption ? selectedOption.label : (placeholder || 'Select Option')
                        }
                    </Text>
                    {(selectedOption?.subtitle && !isCollapsed) && 
                        <Text style={{ fontFamily: 'fontLight', fontSize: 12 }}>{selectedOption?.subtitle}</Text>
                    }
                </View>
                <View style={{ justifyContent: 'center' }}>
                    <Icon
                        size={24}
                        type="Ionicons"
                        name={!isCollapsed ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
                        color={!isCollapsed ? colors.grey : colors.primary}
                    />
                </View>
            </TouchableOpacity>

            {isCollapsed && (
                <View
                    style={{
                        borderRadius: 10,
                        borderWidth: 2,
                        borderTopWidth: 0,
                        borderColor: colors.primary,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        gap: 6,
                        position: 'absolute',
                        width: '100%',
                        marginTop: 60,
                        zIndex:5,
                        backgroundColor:colors.white
                    }}
                >
                    {isSearch &&
                        <View style={{paddingHorizontal:10}}>
                            <TextArea
                                attr={{
                                    field: 'search',
                                    value: searchValue,
                                    icon: { name: 'search', type: 'Feather', color: colors.primary },
                                    placeholder: 'Search...',
                                    handleChange: (field, value) => setSearchValue(value),
                                }}
                            />
                        </View>
                    }

                    {itemList.filter(item => item.label.toLowerCase().includes(searchValue.toLowerCase())).map((item, i) => (
                        <TouchableOpacity
                            key={item.label+i}
                            onPress={() => {
                                onChange(item);
                                setIsCollapsed(false);
                            }}
                            style={{
                                borderBottomWidth: i !== itemList.length - 1 ? 0.5 : 0,
                                borderBottomColor: colors.secondary,
                                paddingVertical: 10,
                                padding: 10,
                                flexDirection:'row'
                            }}
                        >
                            {item?.image &&
                                <View style={{marginRight:10}}>
                                    <Image source={{uri:item?.image}} style={{width:45,height:45,borderRadius:10}}/>
                                </View>
                            }
                            <View style={{flex:1,justifyContent:'center'}}>
                                <Text style={{ fontFamily: 'fontBold', fontSize: 10, color: colors.grey }}>
                                    {item.label}
                                </Text>
                                {item?.subtitle && 
                                    <Text style={{ fontFamily: 'fontLight', fontSize: 12 }}>{item?.subtitle}</Text>
                                }
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};
