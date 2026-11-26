import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";

export default function Rooms() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");

    useEffect(() => {
        if (!localStorage.getItem("token")) navigate("/login");
    }, []); 

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

    useEffect(() => {
        function onTaskCreated(task) {
            if (task.room !== selectedRoom) return;
            setTasks((prev) => 
                prev.some((t) => t._id === task._id) ? prev: [...prev, task]
        );

        socket.on("task:created", onTaskCreated);
        return () => socket/off("task:created", onTaskCreated);
        }
    }, [selectedRoom]);

    useEffect(() => {
        function onTaskUpdated(updated) {
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        }

        socket.on("task:updated", onTaskUpdated);
        return () => socket.off("task.updated", onTaskUpdated);
    }, []);

    function logout() {
        localStorage.removeItem("token");
        navigate("/login");
      }

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
        socket.emit("join-room", room._id);
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
            <button onClick={logout}>Logout</button>

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