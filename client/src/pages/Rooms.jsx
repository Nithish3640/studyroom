import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";
import { LogOut } from "lucide-react";
import { getToken, clearToken } from "../auth.js";
import { API } from "../config.js";  

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
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!getToken()) navigate("/login");
    }, []); 

    useEffect(() => {
        const token = getToken();

        fetch(`${API}/api/rooms`,
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
        return () => socket.off("task:created", onTaskCreated);
        }
    }, [selectedRoom]);

    useEffect(() => {
        function onTaskUpdated(updated) {
            setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        }

        socket.on("task:updated", onTaskUpdated);
        return () => socket.off("task:updated", onTaskUpdated);
    }, []);

    useEffect(() => {
        function onNoteUpdated(note) {
          if (note.room !== selectedRoom?._id) return;
          setNoteContent(note.content);
        }
      
        socket.on("note:updated", onNoteUpdated);
        return () => socket.off("note:updated", onNoteUpdated);
    }, [selectedRoom]);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        socket.auth = { token };
        socket.connect();
        
        return () => socket.disconnect();
    }, [])

    function logout() {
        clearToken();
        navigate("/login");
      }

    function addRoom() {
        const token = getToken();

        fetch(`${API}/api/rooms`, {
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
        const token = getToken();

        fetch(`${API}/api/rooms/join`, {
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
        const token = getToken();

        fetch(`${API}/api/rooms/${room._id}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) setTasks(data);
            });

        fetch(`${API}/api/rooms/${room._id}/note`, {
            headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => res.json())
            .then((data) => setNoteContent(data.content || ""));
    }

    function addTask() {
        const token = getToken();
      
        fetch(`${API}/api/rooms/${selectedRoom._id}/tasks`, {
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
        const token = getToken();
      
        fetch(`${API}/api/tasks/${task._id}`, {
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
        const token = getToken();
      
        fetch(`${API}/api/rooms/${selectedRoom._id}/note`, {
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
        const token = getToken();
        setLoading(true);
        setSummary("");

        fetch(`${API}/api/rooms/${selectedRoom._id}/summarize`, {
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

    function generateTasks() {
        const token = getToken();
        setGenerating(true);
      
        fetch(`${API}/api/rooms/${selectedRoom._id}/generate-tasks`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (!Array.isArray(data)) alert(data.message || "Could not generate tasks");
          })
          .finally(() => setGenerating(false));
      }

    const taskColumns = [
        { status: "todo", label: "Todo" },
        { status: "doing", label: "Doing" },
        { status: "done", label: "Done" },
      ];

    return (
        <div className="flex h-screen flex-col bg-[#f1eef8] text-[#1a1023]">
          {/* top bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e4dff0] bg-white px-6">
            <span className="text-xl font-bold">StudyRoom</span>
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
            {!selectedRoom ? (
                <div className="flex h-full items-center justify-center text-[#9a8fa3]">
                Select or create a room to get started
                </div>
            ) : (
                <div>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                    <h2 className="text-3xl font-bold tracking-tight">{selectedRoom.name}</h2>
                    <p className="mt-1 text-sm text-[#786f7c]">
                        Join code: <span className="font-semibold text-[#7c3aed]">{selectedRoom.joinCode}</span>
                    </p>
                    </div>
                    <span className="flex items-center gap-1.5 rounded-full bg-[#f3e8ff] px-3 py-1 text-xs font-bold text-[#7c3aed]">
                    <span className="size-1.5 rounded-full bg-[#c026d3]" /> Live
                    </span>
                </div>

                {/* add task */}
                <div className="mb-6 flex gap-2">
                <input
                    placeholder="Add a new task..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    className="h-11 flex-1 rounded-xl border border-[#e4dff0] bg-white px-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
                />
                <button
                    onClick={addTask}
                    className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#f472b6] px-6 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 active:translate-y-0"
                >
                    Add task
                </button>
                </div>

                {/* columns */}
                <div className="grid gap-4 md:grid-cols-3">
                {[
                    ["todo", "To do"],
                    ["doing", "Doing"],
                    ["done", "Done"],
                ].map(([status, label]) => (
                    <div key={status} className="rounded-2xl border border-[#e4dff0] bg-white p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#918796]">
                        {label} ({tasks.filter((t) => t.status === status).length})
                    </p>

                    <div className="space-y-2">
                        {tasks
                        .filter((t) => t.status === status)
                        .map((task) => (
                            <div key={task._id} className="rounded-xl border border-[#eee9e3] bg-[#faf8ff] p-3">
                            <p className="text-sm font-semibold">{task.title}</p>
                            <div className="mt-2 flex gap-1">
                                {["todo", "doing", "done"]
                                .filter((s) => s !== status)
                                .map((s) => (
                                    <button
                                    key={s}
                                    onClick={() => changeStatus(task, s)}
                                    className="rounded-md bg-[#f3e8ff] px-2 py-0.5 text-[10px] font-bold text-[#7c3aed] transition hover:bg-[#e9d5ff]"
                                    >
                                    → {s}
                                    </button>
                                ))}
                            </div>
                            </div>
                        ))}
                    </div>
                    </div>
                ))}
                </div>
                <div className="mt-6 rounded-2xl border border-[#e4dff0] bg-white p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#918796]">Shared notes</p>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={saveNote}
                                className="rounded-full border border-[#7c3aed] px-4 py-1.5 text-xs font-bold text-[#7c3aed] transition hover:bg-[#f1eaff]"
                            >
                                Save note
                            </button>
                            <button
                                onClick={summarize}
                                disabled={loading}
                                className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#f472b6] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {loading ? "Summarizing..." : "✨ Summarize"}
                            </button>
                            <button
                                onClick={generateTasks}
                                disabled={generating}
                                className="rounded-full bg-gradient-to-r from-[#7c3aed] to-[#f472b6] px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {generating ? "Generating..." : "✨ Generate tasks"}
                            </button>
                        </div>
                    </div>

                    <textarea
                        rows={8}
                        placeholder="Write shared notes here, then click Save note..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full resize-none rounded-xl border border-[#e4dff0] bg-[#faf8ff] p-4 text-sm outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/15"
                    />

                    {summary && (
                        <div className="mt-4 rounded-xl bg-[#f3e8ff] p-4">
                        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#7c3aed]">AI summary</p>
                        <p className="whitespace-pre-wrap text-sm">{summary}</p>
                        </div>
                    )}
                    </div>
                </div>
            )}
            </main>
          </div>
        </div>
      );
}