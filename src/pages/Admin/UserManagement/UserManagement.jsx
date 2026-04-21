import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, X } from 'lucide-react';
import './styles.css';

const INITIAL_USERS = [
  { id: 1, firstName: 'Global',  lastName: 'Partnership Manager', email: 'global@loveworld.com',  role: 'global',  region: 'Global',        status: 'active',   joined: '1/10/2024' },
  { id: 2, firstName: 'Zonal',   lastName: 'Partnership Manager', email: 'zonal@loveworld.com',   role: 'zonal',   region: 'North America', status: 'active',   joined: '2/15/2024' },
  { id: 3, firstName: 'System',  lastName: 'Administrator',       email: 'admin@loveworld.com',   role: 'admin',   region: 'Global',        status: 'active',   joined: '1/1/2024'  },
  { id: 4, firstName: 'Finance', lastName: 'Manager',             email: 'finance@loveworld.com', role: 'finance', region: 'Europe',        status: 'inactive', joined: '3/20/2024' },
  { id: 5, firstName: 'John',    lastName: 'Smith',               email: 'john@loveworld.com',    role: 'zonal',   region: 'Africa',        status: 'active',   joined: '4/5/2024'  },
  { id: 6, firstName: 'Sarah',   lastName: 'Johnson',             email: 'sarah@loveworld.com',   role: 'zonal',   region: 'Asia Pacific',  status: 'active',   joined: '4/12/2024' },
];

const ROLE_COLORS = {
  global:  { bg: '#ede9fe', color: '#5b21b6' },
  zonal:   { bg: '#dbeafe', color: '#1d4ed8' },
  admin:   { bg: '#fef9c3', color: '#a16207' },
  finance: { bg: '#fce7f3', color: '#9d174d' },
};

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '',
  role: 'zonal', region: '', status: 'active',
};

export default function UserManagement() {
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [deleteId, setDeleteId]   = useState(null);

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users`);
      const data = await res.json();
      setUsers(data || []);
    } catch(err) { console.log("Failed to load users", err); }
  };

  const filtered = users.filter(u =>
    [u.firstName, u.lastName, u.email, u.role, u.region].some(v =>
      String(v || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const openAdd = () => {
    setEditUser(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, region: u.region, status: u.status });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.email) return;

    if (editUser) {
      await fetch(`${process.env.REACT_APP_API_URL}/api/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } else {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, role: form.role, region: form.region })
      });
      if (res.ok) {
        alert('Invitation Sent! The user will receive an email from sharonshelke7@gmail.com to set up their account.');
      } else {
        const err = await res.text();
        alert('Error: ' + err);
        return;
      }
    }
    
    setShowModal(false);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    await fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchUsers();
  };

  const toggleStatus = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    await fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, status: user.status === 'active' ? 'inactive' : 'active' })
    });
    fetchUsers();
  };

  return (
    <div className="um-page">
      <div className="um-page-header">
        <div>
          <h2>User Management</h2>
          <p>Manage platform users, roles and access</p>
        </div>
        <button className="um-add-btn" onClick={openAdd}>
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="um-stats">
        {[
          { label: 'Total Users',    value: users.length,                               bg: '#ede9fe', color: '#5b21b6' },
          { label: 'Active',         value: users.filter(u => u.status === 'active').length,   bg: '#dcfce7', color: '#16a34a' },
          { label: 'Inactive',       value: users.filter(u => u.status === 'inactive').length, bg: '#fee2e2', color: '#dc2626' },
          { label: 'Roles',          value: 4,                                          bg: '#fff7ed', color: '#ea580c' },
        ].map(s => (
          <div className="um-stat-card" key={s.label}>
            <div className="um-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="um-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="um-panel">
        <div className="um-toolbar">
          <div className="um-search">
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="um-filter-btn"><Filter size={14} /> Filter</button>
        </div>

        <p className="um-count">Showing {filtered.length} users</p>

        <table className="um-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Region</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const rc = ROLE_COLORS[u.role] ?? { bg: '#f3f4f6', color: '#374151' };
              return (
                <tr key={u.id}>
                  <td>
                    <div className="um-user-cell">
                      <div className="um-av" style={{ background: rc.bg, color: rc.color }}>
                        {(u.firstName?.[0] || u.email?.[0] || '?').toUpperCase()}
                      </div>
                      <span className="um-name">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'Pending Invite'}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="um-role-badge" style={{ background: rc.bg, color: rc.color }}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.region}</td>
                  <td>
                    <button
                      className={`um-status-badge ${u.status}`}
                      onClick={() => toggleStatus(u.id)}
                      title="Click to toggle"
                    >
                      {u.status}
                    </button>
                  </td>
                  <td>{u.joined}</td>
                  <td>
                    <div className="um-actions">
                      {u.status === 'pending' && u.inviteToken && (
                        <button 
                          className="um-icon-btn copy" 
                          onClick={() => {
                            const link = `${window.location.origin}/invite?token=${u.inviteToken}`;
                            navigator.clipboard.writeText(link);
                            alert('Invite link copied to clipboard!');
                          }} 
                          title="Copy Invite Link"
                        >
                          <Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                        </button>
                      )}
                      <button className="um-icon-btn edit" onClick={() => openEdit(u)} title="Edit">
                        <Edit2 size={14} />
                      </button>
                      <button className="um-icon-btn del" onClick={() => setDeleteId(u.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="um-overlay">
          <div className="um-modal">
            <div className="um-modal-header">
              <h3>{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="um-modal-close" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="um-modal-body">
              <div className="um-form-grid">
                {editUser && (
                  <>
                    <div className="um-field">
                      <label>First Name</label>
                      <input type="text" value={form.firstName || ''}
                        onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                        placeholder="First name" />
                    </div>
                    <div className="um-field">
                      <label>Last Name</label>
                      <input type="text" value={form.lastName || ''}
                        onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                        placeholder="Last name" />
                    </div>
                  </>
                )}
                <div className={`um-field ${editUser ? 'um-field-full' : ''}`}>
                  <label>Email Address</label>
                  <input type="email" value={form.email || ''} disabled={!!editUser}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="email@loveworld.com" />
                </div>
                <div className="um-field">
                  <label>Role</label>
                  <select value={form.role || 'zonal'}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="regional">Regional Manager</option>
                    <option value="zonal">Zonal Manager</option>
                    <option value="admin">System Administrator</option>
                    <option value="finance">Finance Manager</option>
                  </select>
                </div>
                <div className="um-field">
                  <label>Region</label>
                  <select value={form.region || 'Global'}
                    onChange={e => setForm(p => ({ ...p, region: e.target.value }))}>
                    {['Global','North America','South America','Europe','Africa','Asia Pacific'].map(r => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="um-field">
                  <label>Status</label>
                  <select value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="um-modal-footer">
              <button className="um-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="um-btn-primary" onClick={handleSave}>
                {editUser ? 'Save Changes' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="um-overlay">
          <div className="um-modal um-modal-sm">
            <div className="um-modal-header">
              <h3>Delete User</h3>
              <button className="um-modal-close" onClick={() => setDeleteId(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="um-modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
            </div>
            <div className="um-modal-footer">
              <button className="um-btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="um-btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}