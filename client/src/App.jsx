import { useState, useEffect } from "react";

export default function App() {
    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");

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

    function addTask() {
        const token = localStorage.getItem("token");
      
        fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: taskTitle }),
        })
          .then((res) => res.json())
          .then((task) => {
            if (task._id) {
              setTasks([...tasks, task]);
              setTaskTitle("");
            } else {
              alert(task.message || "Could not add task");
            }
          });
    }

    function changeStatus(task, newStatus) {
        const token = localStorage.getItem("token");
      
        fetch(`http://localhost:5000/api/tasks/${task._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        })
          .then((res) => res.json())
          .then((updated) => {
            if (updated._id) {
              setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));
            } else {
              alert(updated.message || "Could not update task");
            }
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
                    <input
                        placeholder="New task"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <button onClick={addTask}>Add Task</button>
                    {tasks.map((task) => (
                        <p key={task._id}>
                            {task.title} ({task.status}){" "}
                            <button onClick={() => changeStatus(task, "todo")}>Todo</button>
                            <button onClick={() => changeStatus(task, "doing")}>Doing</button>
                            <button onClick={() => changeStatus(task, "done")}>Done</button>
                        </p>
                    ))}
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