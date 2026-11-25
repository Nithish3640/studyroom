import { useState, useEffect } from "react";

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState("");


    useEffect(() => {
        fetch("http://localhost:5000/api/rooms")
        .then(res => res.json())
        .then(data => setRooms(data));
    }, []);

    function addRoom() {
        fetch("http://localhost:5000/api/rooms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({name}),
        })
        .then((res) => res.json())
        .then((newRoom) => {
            setRooms([...rooms, newRoom]);
            setName("");
            console.log(rooms);
        });
    }

    return (
        <div>
            <h1>Study Rooms</h1>
            {rooms.map((room) => 
                <p key={room._id}>{room.name}</p>            
            )}
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={addRoom}>Add Room</button>
        </div>
    )
}