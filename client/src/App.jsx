import React from 'react'
import WalletConnect from "../components/WalletConnect.jsx";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import HomePage from "../pages/HomePage.jsx";
import Dashboard from "../pages/Dashboard.jsx";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    )
}
export default App
