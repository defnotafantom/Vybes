"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Database,
  Shield,
  Settings,
  ChevronRight,
  Search,
  Edit2,
  Trash2,
  Crown,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Tab = "overview" | "users" | "database" | "roles"

interface AdminStats {
  users: number
  posts: number
  events: number
  comments: number
}

interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  role: string
  adminRole: string
  createdAt: string
  _count?: {
    posts: number
    comments: number
    followers: number
    following: number
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [tab, setTab] = useState<Tab>("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [permissions, setPermissions] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dbModel, setDbModel] = useState("user")
  const [dbRecords, setDbRecords] = useState<any[]>([])
  const [roles, setRoles] = useState<any>(null)

  // Check admin access
  useEffect(() => {
    if (status === "loading") return
    if (!session?.user?.adminRole || session.user.adminRole === "USER") {
      router.replace("/dashboard")
    }
  }, [session, status, router])

  // Fetch admin data
  useEffect(() => {
    if (session?.user?.adminRole && session.user.adminRole !== "USER") {
      fetchOverview()
    }
  }, [session])

  const fetchOverview = async () => {
    try {
      const res = await fetch("/api/admin")
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setPermissions(data.permissions)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (search = "") => {
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchDBRecords = async (model: string) => {
    try {
      const res = await fetch(`/api/admin/db?model=${model}`)
      if (res.ok) {
        const data = await res.json()
        setDbRecords(data.records)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles")
      if (res.ok) {
        const data = await res.json()
        setRoles(data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const updateUser = async (userId: string, data: any) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, data }),
      })
      if (res.ok) {
        toast({ title: "Utente aggiornato" })
        fetchUsers(userSearch)
        setSelectedUser(null)
      } else {
        const err = await res.json()
        toast({ title: "Errore", description: err.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Errore", variant: "destructive" })
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
      if (res.ok) {
        toast({ title: "Utente eliminato" })
        fetchUsers(userSearch)
      } else {
        const err = await res.json()
        toast({ title: "Errore", description: err.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Errore", variant: "destructive" })
    }
  }

  useEffect(() => {
    if (tab === "users") fetchUsers()
    if (tab === "database" && permissions?.canReadDB) fetchDBRecords(dbModel)
    if (tab === "roles") fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    )
  }

  const adminRole = session?.user?.adminRole

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-red-100">
              Ruolo: <span className="font-semibold">{adminRole}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "overview", label: "Overview", icon: Settings },
          { id: "users", label: "Utenti", icon: Users },
          { id: "database", label: "Database", icon: Database, requiresDB: true },
          { id: "roles", label: "Ruoli", icon: Crown },
        ].map(({ id, label, icon: Icon, requiresDB }) => {
          if (requiresDB && !permissions?.canReadDB) return null
          return (
            <button
              key={id}
              onClick={() => setTab(id as Tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap",
                tab === id
                  ? "bg-sky-500 text-white shadow-lg"
                  : "bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-700"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {/* Overview Tab */}
          {tab === "overview" && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Utenti", value: stats.users, icon: Users, color: "sky" },
                { label: "Post", value: stats.posts, icon: FileText, color: "emerald" },
                { label: "Eventi", value: stats.events, icon: Calendar, color: "violet" },
                { label: "Commenti", value: stats.comments, icon: MessageSquare, color: "amber" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
                >
                  <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {tab === "users" && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca utenti..."
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value)
                      fetchUsers(e.target.value)
                    }}
                    className="pl-10"
                  />
                </div>
                <Button onClick={() => fetchUsers(userSearch)} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-3 font-medium">Utente</th>
                      <th className="text-left p-3 font-medium">Ruolo</th>
                      <th className="text-left p-3 font-medium">Admin</th>
                      <th className="text-left p-3 font-medium">Stats</th>
                      <th className="text-right p-3 font-medium">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name || "—"}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-lg text-xs font-medium",
                              user.adminRole === "SUPERADMIN"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                : user.adminRole === "ADMIN"
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                : user.adminRole === "MODERATOR"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            )}
                          >
                            {user.adminRole}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gray-500">
                          {user._count && (
                            <span>
                              {user._count.posts} post • {user._count.followers} follower
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {permissions?.canEditUsers && (
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="p-2 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-600"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {permissions?.canDeleteUsers && user.adminRole !== "SUPERADMIN" && (
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Database Tab */}
          {tab === "database" && permissions?.canReadDB && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3 mb-4">
                <select
                  value={dbModel}
                  onChange={(e) => {
                    setDbModel(e.target.value)
                    fetchDBRecords(e.target.value)
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  {["user", "post", "comment", "event", "notification", "quest", "transaction"].map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
                <Button onClick={() => fetchDBRecords(dbModel)} variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded-xl overflow-x-auto">
                  {JSON.stringify(dbRecords, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {tab === "roles" && roles && (
            <div className="space-y-4">
              {roles.roles.map((role: any) => (
                <div
                  key={role.role}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {role.role === "SUPERADMIN" && <Crown className="h-5 w-5 text-red-500" />}
                      {role.role}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {role.permissions.length} permessi
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((perm: string) => (
                      <span
                        key={perm}
                        className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs"
                      >
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length === 0 && (
                      <span className="text-xs text-gray-400">Nessun permesso</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">Modifica Utente</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ruolo Utente
                  </label>
                  <select
                    defaultValue={selectedUser.role}
                    id="edit-role"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  >
                    <option value="DEFAULT">Default</option>
                    <option value="ARTIST">Artist</option>
                    <option value="RECRUITER">Recruiter</option>
                    <option value="ARTIST_RECRUITER">Artist & Recruiter</option>
                  </select>
                </div>
                {permissions?.canManageRoles && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ruolo Admin
                    </label>
                    <select
                      defaultValue={selectedUser.adminRole}
                      id="edit-adminRole"
                      className="w-full mt-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      disabled={selectedUser.adminRole === "SUPERADMIN" && adminRole !== "SUPERADMIN"}
                    >
                      <option value="USER">User</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                      {adminRole === "SUPERADMIN" && (
                        <option value="SUPERADMIN">Superadmin</option>
                      )}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setSelectedUser(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Annulla
                  </Button>
                  <Button
                    onClick={() => {
                      const role = (document.getElementById("edit-role") as HTMLSelectElement)?.value
                      const adminRole = (document.getElementById("edit-adminRole") as HTMLSelectElement)?.value
                      updateUser(selectedUser.id, { role, adminRole })
                    }}
                    className="flex-1 bg-sky-500 hover:bg-sky-600"
                  >
                    Salva
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



