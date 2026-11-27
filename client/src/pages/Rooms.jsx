import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import { LogOut } from "lucide-react";

function Logo() {
    return (
      <div className="flex items-center gap-2.5 text-[#2b1237]">
        <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#f472b6] text-white shadow-[0_7px_18px_rgba(124,58,237,0.24)]">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4.5 5.5A2.5 2.5 0 0 1 7 3h5v15H7a2.5 2.5 0 0 0-2.5 2.5v-15Z" />
            <path d="M19.5 5.5A2.5 2.5 0 0 0 17 3h-5v15h5a2.5 2.5 0 0 1 2.5 2.5v-15Z" />
          </svg>
        </div>
        <span className="text-[21px] font-bold tracking-[-0.04em]">StudyRoom</span>
      </div>
    );
  }

export default function Rooms() {
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [name, setName] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [noteContent, setNoteContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState("");

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

    useEffect(() => {
        function onNoteUpdated(note) {
          if (note.room !== selectedRoom?._id) return;
          setNoteContent(note.content);
        }
      
        socket.on("note:updated", onNoteUpdated);
        return () => socket.off("note:updated", onNoteUpdated);
    }, [selectedRoom]);

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

        fetch(`http://localhost:5000/api/rooms/${room._id}/note`, {
            headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.json())
            .then((data) => setNoteContent(data.content || ""));
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

    function saveNote() {
        const token = localStorage.getItem("token");
      
        fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/note`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: noteContent }),
        })
          .then((res) => res.json())
          .then((note) => {
            if (!note.content && note.message) alert(note.message);
          });
    }

    function summarize() {
        console.log("Summarize clicked")
        const token = localStorage.getItem("token");
        setLoading(true);
        setSummary("");

        fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}/summarize`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.summary) {
                    setSummary(data.summary);
                } else {
                    alert(data.message || "Could not summarize")
                }
            })
            .finally(() => setLoading(false));
    }

    return (
        <div className="flex h-screen flex-col bg-[#f1eef8] text-[#1a1023]">
          {/* top bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e4dff0] bg-white px-6">
            <span className="text-xl font-bold"><logo />StudyRoom</span>
            <button onClick={logout} className="flex items-center gap-2 text-sm font-semibold text-[#786f7c] hover:text-[#7c3aed]">
              <LogOut size={16} /> Logout
            </button>
          </header>
      
          <div className="flex min-h-0 flex-1">
            {/* sidebar */}
            <aside className="w-72 shrink-0 overflow-y-auto border-r border-[#e4dff0] bg-[#faf8ff] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#7c3aed]">My rooms</p>

            <div className="space-y-1">
            {rooms.map((room) => {
                const active = selectedRoom?._id === room._id;
                return (
                <button
                    key={room._id}
                    onClick={() => openRoom(room)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                    active
                        ? "bg-gradient-to-r from-[#7c3aed] to-[#f472b6] text-white shadow-md"
                        : "hover:bg-[#f1eaff]"
                    }`}
                >
                    <p className="text-sm font-semibold">{room.name}</p>
                    <p className={`text-xs ${active ? "text-white/80" : "text-[#9a8fa3]"}`}>Code: {room.joinCode}</p>
                </button>
                );
            })}
            </div>

            <div className="mt-6 space-y-2 border-t border-[#e4dff0] pt-4">
            <input
                placeholder="New room name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#e4dff0] bg-white px-3 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
            />
            <button onClick={addRoom} className="w-full rounded-full bg-[#7c3aed] py-2 text-sm font-semibold text-white transition hover:bg-[#6d28d9]">
                Add room
            </button>
            </div>

            <div className="mt-4 space-y-2">
            <input
                placeholder="Join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full rounded-xl border border-[#e4dff0] bg-white px-3 py-2 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
            />
            <button onClick={joinRoom} className="w-full rounded-full border border-[#7c3aed] py-2 text-sm font-semibold text-[#7c3aed] transition hover:bg-[#f1eaff]">
                Join room
            </button>
            </div>
            </aside>
      
            {/* main */}
            <main className="flex-1 overflow-y-auto p-6">
            {selectedRoom && (
                <div>
                <h3>Tasks in {selectedRoom.name}</h3>
                <input placeholder="New task" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                <button onClick={addTask}>Add Task</button>
                {tasks.map((task) => (
                    <p key={task._id}>
                    {task.title} ({task.status}){" "}
                    <button onClick={() => changeStatus(task, "todo")}>Todo</button>
                    <button onClick={() => changeStatus(task, "doing")}>Doing</button>
                    <button onClick={() => changeStatus(task, "done")}>Done</button>
                    </p>
                ))}
                <h3>Shared Notes</h3>
                <textarea rows={8} cols={50} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
                <br />
                <button onClick={saveNote}>Save Note</button>
                <button onClick={summarize} disabled={loading}>
                    {loading ? "Summarizing..." : "Summarize with AI"}
                </button>
                {summary && (
                    <div>
                    <h4>AI Summary</h4>
                    <p style={{ whiteSpace: "pre-wrap" }}>{summary}</p>
                    </div>
                )}
                </div>
            )}
            </main>
          </div>
        </div>
      );

    /* return (
        <div>
            <button onClick={logout}>Logout</button>

            <h1>Study Rooms</h1>
            {rooms.map((room) => 
                <p key={room._id} onClick={() => openRoom(room)} style={{ cursor: "pointer"}}>
                    {room.name} (Code: {room.joinCode})
                </p>            
            )}
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <button onClick={addRoom}>Add Room</button>
            <h3>Join a room</h3>
            <input placeholder="Join code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <button onClick={joinRoom}>Join</button>
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
                    <h3>Shared Notes</h3>
                    <textarea
                    rows={8}
                    cols={50}
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    />
                    <br />
                    <button onClick={saveNote}>Save Note</button>
                    <button onClick={summarize} disabled={loading}>
                        {loading ? "Summarizing..." : "Summarize with AI" }
                    </button>
                    {summary && (
                        <div>
                            <h4>AI Summary</h4>
                            <p style={{ whiteSpace: "pre-wrap"}}>{summary}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    ) */
}