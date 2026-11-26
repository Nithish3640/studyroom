import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Rooms from "./pages/Rooms.jsx";

export default function App() {
    return(
        <Routes>
            <Route path="/" element={<Rooms />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    );
}