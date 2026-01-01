import axios from 'axios';

const API_URL = "http://localhost:8080/api";

export const api = {
    // Get User Profile
    getUser: async (walletAddress) => {
        try {
            const response = await axios.get(`${API_URL}/auth/user/${walletAddress}`);
            return response.data;
        } catch (err) {
            // If user doesn't exist, return null so frontend knows to redirect to Register
            if (err.response && err.response.status === 404) {
                return null;
            }
            throw err;
        }
    },

    // Register New User
    registerUser: async (userData) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    },

    // Upload File (FIXED)
    uploadFile: async (file, patientAddress) => {
        const formData = new FormData();
        formData.append("file", file);

        // We append the address to the URL so the backend knows who owns this file
        const response = await axios.post(`${API_URL}/records/upload?patientAddress=${patientAddress}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    }
};