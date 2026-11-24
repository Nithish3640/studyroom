import { useState, useEffect } from "react";

export default function App() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/rooms")
        .then(res => res.json())
        .then(data => setRooms(data));
    }, []);

    return (
        <div>
            <h1>Study Rooms</h1>
            {rooms.map((room) => 
                <p key={room.id}>{room.name}</p>            
            )}
        </div>
    )
}