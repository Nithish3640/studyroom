import { useState, useEffect } from "react";

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch("http://localhost:5000/api/rooms",
            {
                headers: { Authorization: `Bearer ${token}`},
            }
        )
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data)) setRooms(data);
        });
    }, []);

    function addRoom() {
        const token = localStorage.getItem("token");

        fetch("http://localhost:5000/api/rooms", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({name}),
        })
            .then((res) => res.json())
            .then((newRoom) => {
                if (newRoom._id) {
                    setRooms([...rooms, newRoom]);
                    setName("");
                } else {
                    alert(newRoom.message || "Could not add room");
                }
            });
    }

    function login() {
        fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    alert("Logged in!");
                } else{
                    alert(data.message || "Login failed");
                }
            });
    }

    function joinRoom() {
        const token = localStorage.getItem("token");

        fetch("http://localhost:5000/api/rooms/join", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ joinCode }),
        })
            .then((res) => res.json())
            .then((room) => {
                if (room._id) {
                    if (!rooms.some((r) => r._id === room._id)) {
                        setRooms([...rooms, room]);
                    }
                    setJoinCode("");
                } else {
                    alert(room.message || "Could not join");
                }
            });
    }

    function openRoom(room) {
        setSelectedRoom(room);
        const token = localStorage.getItem("token");

        fetch(`http://localhost:5000/api/rooms/${room._id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setTasks(data);
            });
    }

    return (
        <div>
            <h2>Login</h2>
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
            <h1>Study Rooms</h1>
            {rooms.map((room) => 
                <p key={room._id} onClick={() => openRoom(room)} style={{ cursor: "pointer"}}>
                    {room.name} (Code: {room.joinCode})
                </p>            
            )}
            {selectedRoom && (
                <div>
                    <h3>Tasks in {selectedRoom.name}</h3>
                    {tasks.map((task) => {
                        return <p key={task._id}>{task.title} ({task.status})</p>
                    })}
                </div>
            )}
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={addRoom}>Add Room</button>
            <h3>Join a room</h3>
            <input placeholder="Join code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <button onClick={joinRoom}>Join</button>
        </div>
    )
}