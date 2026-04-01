"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';
import { LogOut, Plus, CheckCircle2, Circle, Clock, LayoutDashboard, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Task {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    created_at: string;
}

export default function Dashboard() {
    const { logout, isAuthenticated } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDesc, setNewTaskDesc] = useState('');
    const router = useRouter();

    const fetchTasks = async () => {
        try {
            const res = await client.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        } else {
            fetchTasks();
        }
    }, [isAuthenticated, router]);

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const res = await client.post('/tasks', {
                title: newTaskTitle,
                description: newTaskDesc,
            });
            setTasks([res.data, ...tasks]);
            setNewTaskTitle('');
            setNewTaskDesc('');
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const res = await client.put(`/tasks/${id}/status`, { status });
            setTasks(tasks.map((t) => (t.id === id ? res.data : t)));
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DONE': return <CheckCircle2 className="text-green-500" size={20} />;
            case 'IN_PROGRESS': return <Clock className="text-yellow-500" size={20} />;
            default: return <Circle className="text-gray-300" size={20} />;
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg text-white">
                                <LayoutDashboard size={20} />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                                Workspace
                            </span>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors py-2 px-3 rounded-lg hover:bg-red-50"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline font-medium text-sm">Sign out</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Create Task Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Plus className="text-blue-500" size={20} /> New Task
                            </h3>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Task title"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none font-medium"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Description (optional)"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none min-h-[100px] resize-none text-sm"
                                        value={newTaskDesc}
                                        onChange={(e) => setNewTaskDesc(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-md shadow-blue-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                >
                                    Create Task
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Task List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">All Tasks</h3>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <input type="text" placeholder="Search tasks..." className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48 sm:w-64 transition-all" />
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                    <div className="mx-auto w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-3">
                                        <Clock size={24} />
                                    </div>
                                    <p className="text-gray-500 font-medium">No tasks found. Create one to get started!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 transition-all items-start sm:items-center"
                                        >
                                            <button
                                                onClick={() => updateStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                                                className="mt-1 sm:mt-0 flex-shrink-0 hover:scale-110 transition-transform"
                                            >
                                                {getStatusIcon(task.status)}
                                            </button>

                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-base font-semibold truncate ${task.status === 'DONE' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                    {task.title}
                                                </h4>
                                                {task.description && (
                                                    <p className={`text-sm mt-1 line-clamp-2 ${task.status === 'DONE' ? 'text-gray-300' : 'text-gray-500'}`}>
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flexitems-center gap-2 mt-3 sm:mt-0 flex-shrink-0">
                                                <select
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border outline-none appearance-none cursor-pointer transition-colors ${task.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            task.status === 'IN_PROGRESS' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                'bg-gray-100 text-gray-700 border-gray-200'
                                                        }`}
                                                    value={task.status}
                                                    onChange={(e) => updateStatus(task.id, e.target.value)}
                                                >
                                                    <option value="TODO">To Do</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="DONE">Done</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
