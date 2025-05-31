import axios from 'axios';
import { useSecrets } from './useSecrets';

type FetchDataTypes = {endPoint: string; method: 'POST' | 'GET' | 'UPDATE' | 'DELETE'; data?: any;};

const useFetch = () => {
    const {secrets} = useSecrets();
    const fetchData = async ({ endPoint, method, data }: FetchDataTypes) => {
        try {
            const url = secrets?.baseUrl + endPoint;
            console.log(url)
            let response = await axios({method, url, data});
            return response.data;
        } catch (error) {
            console.log('Error fetching data:', error);
            return false;
        }
    };
    return { fetchData };
};

export default useFetch;
