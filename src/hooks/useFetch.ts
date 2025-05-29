import axios from 'axios';

const BASE_URL = 'http://192.168.18.229:3000';

type FetchDataTypes = {endPoint: string; method: 'POST' | 'GET' | 'UPDATE' | 'DELETE'; data?: any;};

const useFetch = () => {
    const fetchData = async ({ endPoint, method, data }: FetchDataTypes) => {
        try {
            const url = BASE_URL + endPoint;
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
