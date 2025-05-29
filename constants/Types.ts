
import { KeyboardTypeOptions, StyleProp, TouchableOpacityProps, ViewStyle } from "react-native"

export type UserRole = 'patron' | 'dj' | 'admin' | 'doctor' | 'patient';

export type DoctorSpecialty =
  'General Practitioner' |
  'Cardiologist' |
  'Dermatologist' |
  'Pediatrician' |
  'Neurologist' |
  'Psychiatrist' |
  'Orthopedic' |
  'Gynecologist' |
  'Ophthalmologist' |
  'Dentist' |
  'AI Doctor';

export type DoctorAvailability = {
  days: string[]; // e.g., ['Monday', 'Tuesday', 'Wednesday']
  startTime: string; // e.g., '09:00'
  endTime: string; // e.g., '17:00'
};

export type DoctorRating = {
  average: number; // 1-5 scale
  count: number; // Number of ratings
  reviews?: DoctorReview[];
};

export type DoctorReview = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: number; // timestamp
};

export interface PlayMyJamProfile {
  userId?: string;
  fname_lower?:string;
  operatingHours?: string;
  callType?: string;
  callId?: string;
  token?: string;
  code?: number | string;
  acceptTerms?: boolean;
  password?: string;
  referredBy?: string;
  apiKey?: string;
  photos?: {
    photoId: number;
    url: string;
  }[];
  about?: string;
  rates?: string[];
  balance?: number;
  deleted?: boolean;
  address?: LocationType;
  geoHash?: string;
  fname?: string;
  phoneNumber?: string;
  avatar?: string;
  isVerified?: boolean;
  date?: number;
  isDoctor?: boolean;
  specialty?: DoctorSpecialty;
  experience?: number; // years of experience
  education?: string[];
  certifications?: string[];
  availability?: DoctorAvailability;
  rating?: DoctorRating;
  fees?: number;
  supportsHomeVisit?: boolean;
  homeVisitFee?: number;
  isAI?: boolean;
  practitionerNumber?: string;
}
export type PrivacyType = {
  type:string;
  selected:boolean;
  amount?:number;
  value?:string;
  subscriptions?:string[];
}
export type IconType = {
    size?:number,
    color:string,
    type:string,
    name:string,
    min?:number
}
export interface TextAreaProps {
  attr: {
    icon: IconType;
    placeholder: string;
    keyboardType?: KeyboardTypeOptions;
    field: string;
    value?: string;
    color?:string;
    height?:any;
    multiline?:boolean;
    isSendInput?:boolean;
    borderRadius?:number;
    onSendClicked?: () => any;
    onFocus?: () => any;
    editable?: boolean;
    handleChange: (field: string, value: string) => any;
  };
  style?: StyleProp<ViewStyle>;
}
export interface ButtonProps extends TouchableOpacityProps {
    btnInfo?: {
      styles?: StyleProp<ViewStyle>;
    };
    textInfo?: {
      text?: string;
      color?: string;
    };
    iconInfo: IconType;
    handleBtnClick: () => void;
}
export interface IconButtonProps {
  iconInfo: IconType;
  handleBtnClick: () => void;
}
export interface AddressButtonProps {
  handleBtnClick: (value:LocationType) => void;
  placeholder?:string;
}
export type LocationType = {
  latitude:number;
  longitude:number;
  text?:string;
  short_name?:string;
  long_name?:string
}
export interface DateButtonProps {
  handleBtnClick: (value:string) => void;
  placeholder?:string;
  mode: 'date' | 'time'
}
export type CountryDataType = {
  dialCode:string;
  name:string;
  flag:string;
}
export type ConfirmDialogType = {
  isVisible: boolean,
  text: string,
  okayBtn: string,
  cancelBtn: string,
  hasHideModal:boolean,
  isSuccess?: boolean,
  response?:any,
  severity?:boolean
}
export type LocationInputProps = {
  handleChange: (field: string, value: object) => void;
  field: string;
  placeHolder: string;
};

export interface SecretsType {
  OPENAI_API: string;
  appAccountId:string;
  appleApproved:boolean;
  WHATSAPP: string;
  SMS_AUTH: string;
  SMS_KEY: string;
  canSendSms: boolean;
  googleApiKey:string;
  googleApiKeyActive:boolean;
  deliveryFee:number;
  payFastMerchantId:string;
  vatFee:number
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: DoctorSpecialty;
  doctorAvatar: string;
  patientId: string;
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  type: AppointmentType;
  symptoms: string;
  notes: string;
  fee: number;
  paymentMethod: 'cash' | 'card';
  location?: {
    text: string;
    latitude: number;
    longitude: number;
  };
  createdAt: number; // timestamp
}
export type AppointmentStatus =
  'pending' |
  'confirmed' |
  'completed' |
  'cancelled';

export type AppointmentType =
  'clinic' |
  'home' |
  'video';