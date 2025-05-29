import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, query, where, updateDoc, GeoPoint, orderBy, limit, deleteDoc, onSnapshot, Timestamp, FirestoreError, startAfter, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { initializeFirestore } from 'firebase/firestore'
import { geohashForLocation, geohashQueryBounds,Geohash} from 'geofire-common';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
// @ts-ignore
import geohash from "ngeohash";
import { Appointment, AppointmentStatus, PlayMyJamProfile } from "@/constants/Types";
import { AI_DOCTOR } from "../data/dummyDoctors";

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPracticeNumber?: string;
  doctorAddress?: string;
  doctorPhoneNumber?: string;
  patientId: string;
  patientName: string;
  patientAddress?: string;
  patientPhoneNumber?: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  instructions: string;
  status: 'pending' | 'collected' | 'cancelled';
  createdAt: number;
}

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyBMaeratxolleF0cB4XtHurLklXbgNchGc",
  authDomain: "smarthealth-a0720.firebaseapp.com",
  projectId: "smarthealth-a0720",
  storageBucket: "smarthealth-a0720.appspot.com",
  messagingSenderId: "393573646039",
  appId: "1:393573646039:web:456cc0af5be5d6b2773a92"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true })
export const auth = getAuth(app);
export const storage = getStorage(app);

export const getGeoPoint = (latitude: number, longitude: number) => geohashForLocation([latitude, longitude]);

export const createData = async (tableName: string, docId: string, data: any): Promise<boolean> => {
  try {
    await setDoc(doc(db, tableName, docId), data);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const loginApi = async (phoneNumber: string, password: string): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("phoneNumber", "==", phoneNumber), where("password", "==", password), where("deleted", "==", false)));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};
export const getMessages = async (userId:string,activeUserId:string,cb:(...args:any) => void) => {

  try {
      let q = query(collection(db, "chat"), where("participants", "array-contains-any", [userId,activeUserId]));
      onSnapshot(q, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => doc.data());
        cb(data)
      });
  } catch (e) {
      cb(e);
  }
}
export const getTransactions = async (userId: string): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "transactions"), where("participants", "array-contains-any", [userId])));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};
export const getAllMessages = async (user1: string,user2:string,cb: (...args:any) => void) => {
  try {
    const q = query(collection(db, "chat"), where("participants", "array-contains-any", [user1,user2]));
    return new Promise<any[]>((resolve, reject) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesFireStore = querySnapshot.docChanges().map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        });
        if (messagesFireStore.length > 0) {
          cb(messagesFireStore);
          resolve(messagesFireStore);

        }
      }, (error) => {
        reject(error);
      });
      return () => unsubscribe();
    });
  } catch (error) {
    console.error(error);
    return [];
  }
};
export const getSecretKeys = async (): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "secrets")));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const deleteData = async (tableName: string, docId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, tableName, docId));
    return true;
  } catch (e) {
    return false;
  }
};
export const updateTable = async (tableName: string, docId: string, obj:any): Promise<boolean> => {
  try {
    const docRef = doc(db, tableName, docId);
    await updateDoc(docRef, obj);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
export const updateData = async (tableName: string, docId: string, obj: { field: string; value: any }): Promise<boolean> => {
  try {
    const docRef = doc(db, tableName, docId);
    await updateDoc(docRef, { [obj.field]: obj.value });
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
export const getUserDetailsByPhone = async (phoneNumber: string): Promise<any[]> => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "users"), where("phoneNumber", "==", phoneNumber)));
      const data = querySnapshot.docs.map((doc) => doc.data());
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
};
export const getNearbyDoctors = async (
  latitude: number,
  longitude: number,
  radiusInKm: number = 10,
): Promise<PlayMyJamProfile[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("isDoctor", "==", true)));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return [AI_DOCTOR, ...data];
  } catch (error) {
    console.error('Error getting nearby doctors:', error);
    return [AI_DOCTOR]; // Return at least the AI doctor
  }
};

export const getUserDetailsByUserId = async (userId: string): Promise<any[]> => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
    const data = querySnapshot.docs.map((doc) => doc.data());
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
};
export const uploadFile = async (file: string, path: string): Promise<string> => {
  const storage = getStorage(app);
  const fileRef = ref(storage, path);
  const response = await fetch(file);
  const blob = await response.blob();
  const uploadTask = await uploadBytesResumable(fileRef, blob);
  const url = await getDownloadURL(uploadTask.ref);
  return url;
};

const getGeohashRange = (latitude:number,longitude:number,distance:number) => {
  const lat = 0.0144927536231884;
  const lon = 0.0181818181818182;
  const lowerLat = latitude - lat * distance;
  const lowerLon = longitude - lon * distance;
  const upperLat = latitude + lat * distance;
  const upperLon = longitude + lon * distance;
  const lower = geohash.encode(lowerLat, lowerLon);
  const upper = geohash.encode(upperLat, upperLon);
  return {
    lower,
    upper
  };
};

export const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment | null> => {
  try {
    const appointmentData: Appointment = {
      ...appointment,
      id: `appointment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
    };

    await setDoc(doc(db, 'appointments', appointmentData.id), appointmentData);

    // Create a chat room for this appointment if it doesn't exist
    //await createChatRoomForAppointment(appointmentData);

    return appointmentData;
  } catch (error) {
    console.error('Error booking appointment:', error);
    return null;
  }
};

// Get user appointments - works for both patients and doctors
export const getUserAppointments = async (userId: string, isDoctor = false): Promise<Appointment[]> => {
  try {
    // Query based on whether the user is a doctor or patient
    const fieldToQuery = isDoctor ? 'doctorId' : 'patientId';

    const q = query(
      collection(db, 'appointments'),
      where(fieldToQuery, '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Appointment);
  } catch (error) {
    console.error('Error getting appointments:', error);
    return [];
  }
};

// Update appointment status
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: Appointment['status'],
  notes?: string
): Promise<boolean> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    const updateData: Record<string, any> = { status };

    if (notes) updateData.notes = notes;

    await updateDoc(appointmentRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return false;
  }
};

// Reschedule appointment
export const rescheduleAppointment = async (
  appointmentId: string,
  newDate: string,
  newTime: string
): Promise<boolean> => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      date: newDate,
      time: newTime,
      status: 'confirmed' as AppointmentStatus
    });
    return true;
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return false;
  }
};

// Create prescription
export const createPrescription = async (prescription: Omit<Prescription, 'id' | 'createdAt' | 'status' | 'doctorPracticeNumber' | 'doctorAddress' | 'doctorPhoneNumber' | 'patientAddress' | 'patientPhoneNumber'>): Promise<Prescription | null> => {
  try {
    // Fetch doctor details
    const doctorDetails = await getUserById(prescription.doctorId);

    // Fetch patient details
    const patientDetails = await getUserById(prescription.patientId);

    const prescriptionData: Prescription = {
      ...prescription,
      id: `prescription-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'pending', // Default status
      createdAt: Date.now(),
      // Add doctor details
      doctorPracticeNumber: doctorDetails?.practitionerNumber || '',
      doctorAddress: doctorDetails?.address?.text || '',
      doctorPhoneNumber: doctorDetails?.phoneNumber || '',
      // Add patient details
      patientAddress: patientDetails?.address?.text || '',
      patientPhoneNumber: patientDetails?.phoneNumber || '',
    };

    await setDoc(doc(db, 'prescriptions', prescriptionData.id), prescriptionData);
    return prescriptionData;
  } catch (error) {
    console.error('Error creating prescription:', error);
    return null;
  }
};

// Get prescriptions by appointment
export const getPrescriptionsByAppointment = async (appointmentId: string): Promise<Prescription[]> => {
  try {
    const q = query(
      collection(db, 'prescriptions'),
      where('appointmentId', '==', appointmentId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Prescription);
  } catch (error) {
    console.error('Error getting prescriptions:', error);
    return [];
  }
};

// Get prescriptions by patient
export const getPrescriptionsByPatient = async (patientId: string): Promise<Prescription[]> => {
  try {
    const q = query(
      collection(db, 'prescriptions'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Prescription);
  } catch (error) {
    console.error('Error getting patient prescriptions:', error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<PlayMyJamProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data() as PlayMyJamProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Get all prescriptions (for admin or current user)
export const getAllPrescriptions = async (): Promise<Prescription[]> => {
  try {
    const q = query(
      collection(db, 'prescriptions'),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Prescription);
  } catch (error) {
    console.error('Error getting all prescriptions:', error);
    return [];
  }
};

// Update prescription
export const updatePrescription = async (
  prescriptionId: string,
  updates: Partial<Prescription>
): Promise<boolean> => {
  try {
    const prescriptionRef = doc(db, 'prescriptions', prescriptionId);
    await updateDoc(prescriptionRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating prescription:', error);
    return false;
  }
};