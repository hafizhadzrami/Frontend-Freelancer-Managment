import { useEffect, useState } from "react";
import axios from "axios";

// Backend API URL
const API = "https://localhost:7007/api/Freelancers";

export default function App() {
    const [freelancers, setFreelancers] = useState([]);
    const [form, setForm] = useState({ username: "", email: "", phoneNumber: "", skillsets: "", hobbies: "" });
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // all | active | archived

    // Load all
    const load = async () => {
        try {
            const res = await axios.get(API);
            setFreelancers(res.data);
        } catch (err) {
            console.error("Load error:", err.response || err.message);
            alert("❌ Failed to load freelancers. Check backend URL & CORS.");
        }
    };

    // Search
    const doSearch = async () => {
        if (!search.trim()) {
            load();
            return;
        }
        try {
            const res = await axios.get(`${API}/search`, {
                params: { query: search }
            });
            setFreelancers(res.data);
        } catch (err) {
            console.error("Search error:", err.response || err.message);
            alert("❌ Search failed. Endpoint /search ada?");
        }
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        if (!form.username.trim() || !form.email.trim() || !form.phoneNumber.trim() || !form.skillsets.trim() || !form.hobbies.trim()) {
            alert("Please fill in all fields");
            return;
        }

        const payload = {
            username: form.username,
            email: form.email,
            phoneNumber: form.phoneNumber,
            isArchived: false,
            skillsets: form.skillsets.split(",").map(s => s.trim()).filter(Boolean),
            hobbies: form.hobbies.split(",").map(h => h.trim()).filter(Boolean)
        };

        try {
            if (editingId) {
                await axios.put(`${API}/${editingId}`, { ...payload, id: editingId });
                setEditingId(null);
            } else {
                await axios.post(API, payload);
            }
            setForm({ username: "", email: "", phoneNumber: "", skillsets: "", hobbies: "" });
            load();
        } catch (err) {
            console.error("Save error:", err.response || err.message);
            alert("❌ Failed to save. Check API payload & endpoint.");
        }
    };

    const remove = async (id) => {
        if (window.confirm("Delete this freelancer?")) {
            try {
                await axios.delete(`${API}/${id}`);
                load();
            } catch (err) {
                console.error("Delete error:", err.response || err.message);
                alert("❌ Failed to delete.");
            }
        }
    };

    const archiveToggle = async (id, archived) => {
        try {
            await axios.patch(`${API}/${id}/${archived ? "unarchive" : "archive"}`);
            load();
        } catch (err) {
            console.error("Archive error:", err.response || err.message);
            alert("❌ Failed to archive/unarchive.");
        }
    };

    const edit = (f) => {
        setEditingId(f.id);
        setForm({
            username: f.username,
            email: f.email,
            phoneNumber: f.phoneNumber,
            skillsets: f.skillsets.join(","),
            hobbies: f.hobbies.join(",")
        });
    };

    // Filtered data
    const filteredFreelancers = freelancers.filter(f => {
        if (filter === "active") return !f.isArchived;
        if (filter === "archived") return f.isArchived;
        return true;
    });

    return (
        <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
            <h1>Freelancer Manager</h1>

            {/* Search */}
            <div style={{ marginBottom: "20px" }}>
                <input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: "6px", width: "60%", marginRight: "8px" }}
                />
                <button onClick={doSearch} style={{ padding: "6px 12px", background: "purple", color: "white", border: "none", borderRadius: "4px" }}>
                    Search
                </button>
                <button onClick={load} style={{ padding: "6px 12px", marginLeft: "5px", background: "gray", color: "white", border: "none", borderRadius: "4px" }}>
                    Reset
                </button>
            </div>

            {/* Filter Buttons */}
            <div style={{ marginBottom: "20px" }}>
                <button onClick={() => setFilter("all")}
                    style={{ marginRight: "10px", padding: "6px 12px", background: filter === "all" ? "black" : "lightgray", color: "white", border: "none", borderRadius: "4px" }}>
                    Show All
                </button>
                <button onClick={() => setFilter("active")}
                    style={{ marginRight: "10px", padding: "6px 12px", background: filter === "active" ? "green" : "lightgray", color: "white", border: "none", borderRadius: "4px" }}>
                    Show Active
                </button>
                <button onClick={() => setFilter("archived")}
                    style={{ padding: "6px 12px", background: filter === "archived" ? "red" : "lightgray", color: "white", border: "none", borderRadius: "4px" }}>
                    Show Archived
                </button>
            </div>

            {/* Form */}
            <div style={{ background: "#f0f0f0", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
                <input placeholder="Username" value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    style={{ margin: "5px", padding: "5px" }} />
                <input placeholder="Email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    style={{ margin: "5px", padding: "5px" }} />
                <input placeholder="Phone" value={form.phoneNumber}
                    onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                    style={{ margin: "5px", padding: "5px" }} />
                <input placeholder="Skillsets (comma)" value={form.skillsets}
                    onChange={e => setForm({ ...form, skillsets: e.target.value })}
                    style={{ margin: "5px", padding: "5px" }} />
                <input placeholder="Hobbies (comma)" value={form.hobbies}
                    onChange={e => setForm({ ...form, hobbies: e.target.value })}
                    style={{ margin: "5px", padding: "5px" }} />
                <button onClick={save} style={{ padding: "6px 12px", margin: "5px", background: "blue", color: "white", border: "none", borderRadius: "4px" }}>
                    {editingId ? "Update" : "Add"}
                </button>
            </div>

            {/* List */}
            {filteredFreelancers.map(f => (
                <div
                    key={f.id}
                    style={{
                        border: "1px solid #ddd",
                        padding: "15px",
                        borderRadius: "8px",
                        marginBottom: "10px",
                        background: "#fff",
                        opacity: f.isArchived ? 0.6 : 1
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ margin: 0 }}>{f.username}</h2>
                        {f.isArchived && (
                            <span style={{
                                background: "#dc2626",
                                color: "white",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                fontSize: "12px"
                            }}>
                                Archived
                            </span>
                        )}
                    </div>
                    <p>{f.email} | {f.phoneNumber}</p>
                    <p><b>Skills:</b> {f.skillsets.join(", ")}</p>
                    <p><b>Hobbies:</b> {f.hobbies.join(", ")}</p>
                    <button onClick={() => edit(f)} style={{ marginRight: "5px", padding: "5px 10px", background: "green", color: "white", border: "none", borderRadius: "4px" }}>Edit</button>
                    <button onClick={() => remove(f.id)} style={{ marginRight: "5px", padding: "5px 10px", background: "red", color: "white", border: "none", borderRadius: "4px" }}>Delete</button>
                    <button onClick={() => archiveToggle(f.id, f.isArchived)} style={{ padding: "5px 10px", background: "gray", color: "white", border: "none", borderRadius: "4px" }}>
                        {f.isArchived ? "Unarchive" : "Archive"}
                    </button>
                </div>
            ))}
        </div>
    );
}
