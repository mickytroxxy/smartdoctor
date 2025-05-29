import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { CountryDataType, LocationType } from "@/constants/Types";

const initialState: { location: LocationType; locationWithText:LocationType; countryData:CountryDataType } = {
  location: { latitude: 0, longitude: 0 },
  locationWithText: { latitude: 0, longitude: 0, text:'' },
  countryData:{dialCode:'+27',name:'South Africa',flag:'https://cdn.kcak11.com/CountryFlags/countries/za.svg'}
};

const locationSlice = createSlice({
  name: "locationSlice",
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<LocationType>) => {
      state.location = action.payload;
    },
    setLocationWithText: (state, action: PayloadAction<LocationType>) => {
      state.locationWithText = action.payload;
    },
    setCountryData: (state, action: PayloadAction<CountryDataType>) => {
      state.countryData = action.payload;
    },
  },
});

export const { setLocation, setLocationWithText,setCountryData  } = locationSlice.actions;
export default locationSlice.reducer;
