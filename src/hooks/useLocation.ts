import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setLocation, setLocationWithText } from '../state/slices/location';
import { LocationType } from '@/constants/Types';
import axios from 'axios';
import { useSecrets } from './useSecrets';

const useLocation = () => {
    const { location, locationWithText,countryData } = useSelector((state: RootState) => state.location);
    const dispatch = useDispatch();
    const {secrets} = useSecrets();
    const pickCurrentLocation = async(latitude:number, longitude:number) => {
        try{
            const response = await axios.request({method: 'post',url : "https://maps.googleapis.com/maps/api/geocode/json?latlng="+latitude+","+ longitude+"&sensor=true&key="+secrets.googleApiKey})
            if(response?.data.results.length > 0) {
                const addressComponents = response.data.results[0].address_components;
                const short_name = addressComponents.find((item: any) => item.types.includes('country'))?.short_name;
                const long_name = addressComponents.find((item: any) => item.types.includes('country'))?.long_name;
                dispatch(setLocationWithText({latitude,longitude,text: response.data.results[0].formatted_address,short_name,long_name}));
            }else{
                dispatch(setLocationWithText({latitude,longitude,text: 'No address found'}));
            }
        }catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        Location.installWebGeolocationPolyfill();
        try {
            const currentLocation = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = currentLocation.coords;
            const updatedLocation: LocationType = { latitude, longitude };
            dispatch(setLocation(updatedLocation));
            pickCurrentLocation(latitude, longitude);
        } catch (error) {
            console.error('Error retrieving current location:', error);
        }
        };
        getLocation();
    }, [dispatch]);

    return { location,locationWithText,pickCurrentLocation ,countryData};
};

export default useLocation;
