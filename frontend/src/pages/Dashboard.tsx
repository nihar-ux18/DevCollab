import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/api';
import { CreateRoomData, Room } from '../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [joinRoomId, setJoinRoomId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRooms = async (): Promise<void> => {
      try {
        const response = await roomService.list();
        setRooms(response.data.data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
        toast.error('Failed to load recent rooms');
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return 'unknown';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const handleCreateRoom = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const roomData: CreateRoomData = {
        name: roomName || `Room-${Date.now()}`,
        language,
      };
      const response = await roomService.create(roomData);
      const room = response.data.data;
      toast.success('Room created! 🚀');
      navigate(`/room/${room.roomId}`);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!joinRoomId.trim()) {
      toast.error('Please enter a room ID');
      return;
    }
    setLoading(true);
    try {
      await roomService.join(joinRoomId.trim());
      toast.success('Joined room! 🤝');
      navigate(`/room/${joinRoomId.trim()}`);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(err.response?.data?.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex">
      {/* SideNavBar */}
      <aside className="flex flex-col h-screen w-panel-sidebar fixed left-0 top-0 z-40 bg-surface-container-low border-r border-outline-variant">
        <div className="p-6">
          <Link to="/dashboard" className="text-headline-md font-headline-md text-primary flex items-center gap-2 hover:opacity-90">
            <span className="material-symbols-outlined">terminal</span>
            DevCollab
          </Link>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">Pro Workspace</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <Link className="flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container border-l-2 border-primary transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/history">
            <span className="material-symbols-outlined">history</span>
            History
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/settings">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
        </nav>
        <div className="px-6 py-4">
          <button onClick={logout} className="w-full py-2 bg-error-container/30 text-error font-label-sm text-label-sm rounded-lg hover:bg-error-container/50 transition-colors cursor-pointer border border-error/20 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Wrapper */}
      <div className="ml-[260px] min-h-screen flex flex-col flex-grow">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-margin-desktop h-panel-toolbar sticky top-0 z-50 bg-surface-container border-b border-outline-variant">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 text-body-md font-body-md focus:border-primary outline-none transition-colors text-on-surface" placeholder="Search projects or code..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-variant p-2 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant ml-2 bg-surface-container-highest">
              <img className="object-cover h-full w-full" alt="User Headshot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNq3R-Hjm1jDuxIn91YmckjkR_bNbS7DVTVlXeCgfAwBpMU2_oGzRaxSKOjc5gqXdtxfGOrPrq5RwHDFlpC04m_QGfAtlOMa-9318ZEsRNLILe-xFI3AMhn8Y1Zleivxf6CIL20ZeT2XFKPfJ8fgN2tv09yBppzPXPdTHRRHoJeWADr7Po9qpfv5nVI1HHHX06a-axV21OexbJnJITpW5aL3FxLjDcSc56sCvAK5pfA5QEXWbqzNdrNx2Z7PSHonaPBF7Xcw1zV28" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-grow">
          {/* Greeting */}
          <div className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">Welcome back, {user?.username}!</h2>
          </div>

          {/* Bento Grid Main Content */}
          <div className="grid grid-cols-12 gap-6">
            {/* Action Cards */}
            <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Create Room Card */}
              <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary-container/20 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[32px]">add_circle</span>
                    </div>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-2">Create New Room</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">Initialize a fresh collaborative session with real-time sync.</p>
                </div>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-label-sm text-on-surface-variant">Room Name (Optional)</label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setRoomName(e.target.value)}
                      placeholder="My Awesome Project"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-code-md font-code-md focus:border-primary outline-none text-on-surface"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-label-sm text-on-surface-variant">Language</label>
                    <select
                      value={language}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-code-md font-code-md focus:border-primary outline-none text-on-surface cursor-pointer"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-container text-on-primary-container py-2.5 rounded-lg font-label-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer mt-4"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        <span>Create Room</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Join Room Card */}
              <div className="bg-surface-container-high p-6 rounded-xl border border-outline-variant flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-secondary-container/20 rounded-lg text-secondary">
                      <span className="material-symbols-outlined text-[32px]">hub</span>
                    </div>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-2">Join Room</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">Enter a session ID to pair-program with your team.</p>
                </div>
                <form onSubmit={handleJoinRoom} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-label-sm font-label-sm text-on-surface-variant">Room ID</label>
                    <input
                      type="text"
                      value={joinRoomId}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setJoinRoomId(e.target.value)}
                      placeholder="ID: room-id-here"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-code-md font-code-md focus:border-secondary outline-none text-on-surface"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary-container text-on-secondary-container py-2.5 rounded-lg font-label-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer mt-auto"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">handshake</span>
                        <span>Join Room</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-tertiary">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <h4 className="font-headline-md text-headline-md !text-[16px]">Quick Shortcuts</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Save Room</span>
                    <kbd className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-code-md text-[12px] text-primary">Ctrl + S</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Invite Dev</span>
                    <kbd className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-code-md text-[12px] text-primary">Alt + I</kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Toggle Terminal</span>
                    <kbd className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded font-code-md text-[12px] text-primary">Ctrl + `</kbd>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Rooms Table */}
            <div id="history" className="col-span-12">
              <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
                <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                  <h3 className="font-headline-md text-headline-md">Recent Rooms</h3>
                  <Link to="/history" className="text-primary font-label-sm flex items-center gap-1 hover:underline border-none bg-transparent cursor-pointer no-underline">
                    View all history
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-highest">
                      <tr>
                        <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Name</th>
                        <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Language</th>
                        <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Participants</th>
                        <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Last Active</th>
                        <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {roomsLoading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant opacity-70 font-body-md">
                            <span className="material-symbols-outlined animate-spin text-[24px] align-middle mr-2">sync</span>
                            Loading rooms...
                          </td>
                        </tr>
                      ) : rooms.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant opacity-70 font-body-md">
                            No recent rooms found. Create or join a room above to get started! 🚀
                          </td>
                        </tr>
                      ) : (
                        rooms.map((roomItem) => (
                          <tr
                            key={roomItem.roomId}
                            onClick={() => navigate(`/room/${roomItem.roomId}`)}
                            className="hover:bg-surface-variant transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4 font-body-md text-body-md font-medium text-on-surface hover:text-primary transition-colors">
                              {roomItem.name}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[11px] font-code-md uppercase">
                                {roomItem.language}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex items-center -space-x-2">
                              {roomItem.participants.slice(0, 3).map((p) => (
                                <div
                                  key={p._id}
                                  title={p.username}
                                  className="w-6 h-6 rounded-full border border-surface bg-primary-container text-on-primary-container flex items-center justify-center text-[10px] font-bold"
                                >
                                  {p.username.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {roomItem.participants.length > 3 && (
                                <div className="w-6 h-6 rounded-full border border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                                  +{roomItem.participants.length - 3}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                              {formatRelativeTime(roomItem.updatedAt)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${roomItem.isActive ? 'bg-secondary' : 'bg-outline opacity-50'}`}></div>
                                <span className={`${roomItem.isActive ? 'text-secondary' : 'text-on-surface-variant opacity-50'} text-[12px]`}>
                                  {roomItem.isActive ? 'Live' : 'Inactive'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-margin-desktop py-4 bg-surface-container border-t border-outline-variant flex justify-between items-center opacity-60 mt-auto">
          <div className="font-label-sm text-[11px] flex gap-4">
            <span>SYSTEM STATUS: <span className="text-secondary font-bold">OPERATIONAL</span></span>
            <span>SERVER: <span className="text-on-surface font-bold">US-EAST-1</span></span>
          </div>
          <div className="font-label-sm text-[11px] flex gap-4 items-center">
            <span className="material-symbols-outlined text-[14px]">verified_user</span>
            <span>SECURED SESSION</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;