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
  reviews: DoctorReview[];
};

export type DoctorReview = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: number; // timestamp
};

export interface Doctor {
  id: string;
  name: string;
  specialty: DoctorSpecialty;
  about: string;
  experience: number; // years of experience
  education: string[];
  certifications: string[];
  avatar: string;
  photos: string[];
  availability: DoctorAvailability;
  address: {
    text: string;
    latitude: number;
    longitude: number;
  };
  geoHash: string;
  rating: DoctorRating;
  fees: number;
  phoneNumber: string;
  email: string;
  isVerified: boolean;
  supportsHomeVisit: boolean;
  homeVisitFee: number;
  isAI?: boolean;
}

export interface AIDoctor extends Doctor {
  isAI: true;
}

export type AppointmentStatus =
  'pending' |
  'confirmed' |
  'completed' |
  'cancelled';

export type AppointmentType =
  'surgery' |
  'home' |
  'video';

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
  medicalHistoryAttached: boolean;
  location?: {
    text: string;
    latitude: number;
    longitude: number;
  };
  createdAt: number; // timestamp
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: {
    _id: string;
    name: string;
    avatar: string;
  };
  image?: string;
  sent: boolean;
  received: boolean;
}

export interface ChatRoom {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorAvatar: string;
  patientId: string;
  patientName: string;
  lastMessage: string;
  lastMessageTime: number; // timestamp
  unreadCount: number;
}
