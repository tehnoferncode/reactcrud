import React, { useEffect, useMemo, useState } from "react";
import "../styles/crud.css";

const STORAGE_KEY = "mini_crud_users_v1";

function UserCrudDashboard() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("User");

  // CRUD state
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null); // null = create mode
  const [msg, setMsg] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Load from localStorage (real app behavior)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUsers(JSON.parse(raw));
    } catch (e) {
      // ignore corrupted storage
    }
  }, []);

  // Save to localStorage (real app behavior)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("User");
    setEditId(null);
    setMsg("");
  };

  const validate = () => {
    if (!name.trim()) return "❌ Name is required";
    if (!email.trim()) return "❌ Email is required";
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailOk) return "❌ Please enter a valid email";
    return "";
  };

  const emailExists = (emailToCheck, ignoreId = null) => {
    const e = emailToCheck.trim().toLowerCase();
    return users.some((u) => u.email.toLowerCase() === e && u.id !== ignoreId);
  };

  // CREATE or UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();
    setMsg("");

    const err = validate();
    if (err) {
      setMsg(err);
      return;
    }

    if (emailExists(email, editId)) {
      setMsg("❌ Email already exists");
      return;
    }

    if (editId === null) {
      // CREATE
      const newUser = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name: name.trim(),
        email: email.trim(),
        role,
        createdAt: new Date().toLocaleString(),
      };
      setUsers((prev) => [newUser, ...prev]);
      setMsg("✅ User added successfully");
      setName("");
      setEmail("");
      setRole("User");
    } else {
      // UPDATE
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editId
            ? {
                ...u,
                name: name.trim(),
                email: email.trim(),
                role,
                updatedAt: new Date().toLocaleString(),
              }
            : u
        )
      );
      setMsg("✅ User updated successfully");
      resetForm();
    }
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteUser = (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (editId === id) resetForm();
    setMsg("✅ User deleted");
  };

  const clearAll = () => {
    const ok = window.confirm("Clear all users? This cannot be undone.");
    if (!ok) return;
    setUsers([]);
    resetForm();
    setMsg("✅ All users cleared");
  };

  // SEARCH + FILTER
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  return (
    <div className="crud-page">
      <div className="crud-card">
        <div className="crud-head">
          <div>
            <h2 className="crud-title">🧾 Mini User CRUD Dashboard</h2>
            <p className="crud-subtitle">
              Real CRUD: Create, Read, Update, Delete + Search + LocalStorage
            </p>
          </div>

          <div className="crud-meta">
            <span className="pill">
              Total: <b>{users.length}</b>
            </span>
            <span className="pill">
              Showing: <b>{filteredUsers.length}</b>
            </span>
          </div>
        </div>

        {/* FORM */}
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>

            <div className="field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>User</option>
                <option>Admin</option>
                <option>Seller</option>
                <option>Manager</option>
              </select>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn primary" type="submit">
              {editId === null ? "Add User" : "Update User"}
            </button>

            <button
              className="btn"
              type="button"
              onClick={resetForm}
              disabled={editId === null && !name && !email && role === "User"}
            >
              Reset
            </button>

            <button
              className="btn danger"
              type="button"
              onClick={clearAll}
              disabled={users.length === 0}
            >
              Clear All
            </button>
          </div>

          {msg && <div className="msg">{msg}</div>}
        </form>

        {/* TOOLBAR */}
        <div className="toolbar">
          <input
            className="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, role..."
            disabled={users.length === 0}
          />
          <div className="hint">
            Tip: Click <b>Edit</b> to update any user.
          </div>
        </div>

        {/* LIST */}
        {users.length === 0 ? (
          <div className="empty">
            <div className="empty-title">No users yet</div>
            <div className="empty-sub">Add your first user using the form.</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td className="bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role role-${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{u.createdAt || "-"}</td>
                    <td className="actions-col">
                      <button className="mini" onClick={() => startEdit(u)}>
                        Edit
                      </button>
                      <button
                        className="mini danger"
                        onClick={() => deleteUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="empty small">
                <div className="empty-title">No results found</div>
                <div className="empty-sub">
                  Try a different search keyword.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserCrudDashboard;
