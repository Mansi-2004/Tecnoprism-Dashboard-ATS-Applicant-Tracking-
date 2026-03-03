import { useState, useEffect } from "react";
import { User, Shield, Mail, Calendar, Search, Filter, MoreVertical, UserPlus, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUserData, setNewUserData] = useState({
        name: "",
        email: "",
        password: "",
        role: "recruiter"
    });

    const userRole = localStorage.getItem("ats-role") || "admin";
    const isAdmin = userRole === "admin";
    const isHR = userRole === "hr";

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await api.deleteUser(userId);
                fetchUsers();
                alert("User deleted successfully!");
            } catch (error) {
                alert("Error deleting user: " + error.message);
            }
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.createUser(newUserData);
            setShowAddModal(false);
            setNewUserData({ name: "", email: "", password: "", role: isHR ? "recruiter" : "hr" });
            fetchUsers();
            alert("User created successfully!");
        } catch (error) {
            alert("Error creating user: " + error.message);
        }
    };

    const filteredUsers = users.filter((u) => {
        const name = u.name || u.email || "";
        const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Loading system users...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-muted-foreground">
                        {isHR ? "Manage system recruiters" : `${users.length} registered system users`}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                >
                    <UserPlus className="h-4 w-4" />
                    Add {isHR ? "Recruiter" : "User"}
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..."
                        className="pl-9"
                    />
                </div>
                {isAdmin && (
                    <div className="flex gap-1.5 flex-wrap">
                        {["All", "Admin", "HR", "Recruiter", "Candidate"].map((r) => (
                            <button
                                key={r}
                                onClick={() => setRoleFilter(r)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${roleFilter === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id || user._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    {user.profile_photo ? (
                                                        <AvatarImage src={`http://localhost:8000/${user.profile_photo.replace(/\\/g, '/')}`} className="object-cover" />
                                                    ) : null}
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                                                        {(user.name || user.email || "??").substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                                                        {user.name || "N/A"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === "admin" ? <Shield className="h-3.5 w-3.5 text-destructive" /> : <User className="h-3.5 w-3.5 text-muted-foreground" />}
                                                <span className="text-sm font-medium capitalize">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3.5 w-3.5" />
                                                {new Date(user.created_at || Date.now()).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleDeleteUser(user.id || user._id)}
                                                    className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-2">
                                            <Filter className="h-8 w-8 opacity-20" />
                                            <p className="text-sm">No users found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Add New {isHR ? "Recruiter" : "User"}</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                                <Input
                                    value={newUserData.name}
                                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Email Address *</label>
                                <Input
                                    type="email"
                                    value={newUserData.email}
                                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Password *</label>
                                <Input
                                    type="password"
                                    value={newUserData.password}
                                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {!isHR && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Role *</label>
                                    <select
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                        value={newUserData.role}
                                        onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                                    >
                                        <option value="recruiter">Recruiter</option>
                                        <option value="hr">HR</option>
                                        <option value="admin">Admin</option>
                                        <option value="candidate">Candidate</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                                    Create User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
