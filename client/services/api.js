import axios from 'axios';

const API_URL = "http://localhost:8080/api";

export const api = {
    getUser: async (walletAddress) => {
        try{
            const response = await axios.get(`${API_URL}/auth/user/${walletAddress}`);
            return response.data;
        }catch(err){
            if(err.response && err.response.status === 404){
                return null;
            }
            throw err;
        }
    },

    registerUser: async(userData) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    },

    uploadFile: async(file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(`${API_URL}/records/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    }
};

