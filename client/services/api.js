import axios from 'axios';

const API_URL = "http://localhost:8080/api";

export const api = {
    getUser: async (walletAddress) => {
        try{
            const reponse = await axios.get(`${API_URL}/auth/user/${walletAddress}`);
            return reponse.data;
        }catch(err){
            if(err.response && err.response.status === 404){
                return null;
            }
            throw err;
        }
    },

    registerUser: async(userData) => {
        const response = await asios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    }
};

