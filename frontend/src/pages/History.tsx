import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomService } from '../services/api';
import { Room } from '../types';
import toast from 'react-hot-toast';

const History: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'inactive' | 'me' | 'joined' | 'favorites'>('all');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('devcollab_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchRooms = async (): Promise<void> => {
      try {
        const response = await roomService.list();
        setRooms(response.data.data);
      } catch (error) {
        console.error('Failed to fetch rooms history:', error);
        toast.error('Failed to load rooms history');
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const toggleFavorite = (roomId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setFavorites(prev => {
      const next = prev.includes(roomId)
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId];
      localStorage.setItem('devcollab_favorites', JSON.stringify(next));
      toast.success(prev.includes(roomId) ? 'Removed from favorites' : 'Added to favorites ⭐');
      return next;
    });
    setActiveMenuId(null);
  };

  const copyRoomId = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roomId);
    toast.success('Room ID copied to clipboard! 📋');
    setActiveMenuId(null);
  };

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

  const getLanguageBadgeStyles = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'python') return 'bg-secondary/10 text-secondary border-secondary/20';
    if (l === 'javascript') return 'bg-tertiary/10 text-tertiary border-tertiary/20';
    if (l === 'typescript') return 'bg-primary/10 text-primary border-primary/20';
    if (l === 'java') return 'bg-error/10 text-error border-error/20';
    if (l === 'cpp' || l === 'c') return 'bg-secondary-fixed-dim/10 text-secondary-fixed-dim border-secondary-fixed-dim/20';
    return 'bg-primary-container/10 text-primary-container border-primary-container/20';
  };

  const getAvatarStyles = (username: string) => {
    const colors = [
      { bg: 'bg-primary-container', text: 'text-on-primary-container' },
      { bg: 'bg-secondary-container', text: 'text-on-secondary-container' },
      { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container' },
      { bg: 'bg-error-container', text: 'text-on-error-container' },
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  // Close active dropdown menu when clicking anywhere else
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const totalRooms = rooms.length;
  const activeNow = rooms.filter(r => r.isActive).length;
  const createdByMe = rooms.filter(r => {
    const hostId = typeof r.host === 'object' ? r.host._id : r.host;
    return hostId === user?._id;
  }).length;

  const getMostActiveRoomName = (): string => {
    if (rooms.length === 0) return 'None';
    let maxRoom = rooms[0];
    for (const r of rooms) {
      if ((r.participants?.length || 0) > (maxRoom.participants?.length || 0)) {
        maxRoom = r;
      }
    }
    return maxRoom.name;
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.roomId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const hostId = typeof room.host === 'object' ? room.host._id : room.host;
    const matchesFilter = 
      filterTab === 'all' ? true :
      filterTab === 'active' ? room.isActive :
      filterTab === 'inactive' ? !room.isActive :
      filterTab === 'me' ? hostId === user?._id :
      filterTab === 'joined' ? hostId !== user?._id :
      filterTab === 'favorites' ? favorites.includes(room.roomId) : true;
      
    return matchesSearch && matchesFilter;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
    }
    if (sortOption === 'oldest') {
      return new Date(a.updatedAt || a.createdAt || 0).getTime() - new Date(b.updatedAt || b.createdAt || 0).getTime();
    }
    if (sortOption === 'alphabetical') {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === 'most-active') {
      return (b.participants?.length || 0) - (a.participants?.length || 0);
    }
    return 0;
  });

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
          <Link className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-variant transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link className="flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container border-l-2 border-primary transition-all duration-150 ease-in-out font-label-sm text-label-sm" to="/history">
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
              <input 
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 text-body-md font-body-md focus:border-primary outline-none transition-colors text-on-surface" 
                placeholder="Search rooms..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
          {/* Header & Count */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Recent Rooms</h2>
                <span className="bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded text-[12px] font-medium border border-outline-variant">
                  {totalRooms} {totalRooms === 1 ? 'room' : 'rooms'}
                </span>
              </div>
              <p className="text-on-surface-variant font-body-md text-body-md">Collaborative development sessions from the last 30 days.</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter mb-8">
            <div className="bg-surface-container border border-outline-variant p-4 rounded-xl">
              <p className="text-on-surface-variant font-label-sm text-label-sm mb-1 uppercase tracking-wider">Total Rooms</p>
              <p className="text-headline-md font-headline-md text-on-surface">{totalRooms}</p>
            </div>
            <div className="bg-surface-container border border-outline-variant p-4 rounded-xl">
              <p className="text-on-surface-variant font-label-sm text-label-sm mb-1 uppercase tracking-wider">Active Now</p>
              <div className="flex items-center gap-2">
                <p className="text-headline-md font-headline-md text-secondary">{activeNow}</p>
                {activeNow > 0 && <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>}
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant p-4 rounded-xl">
              <p className="text-on-surface-variant font-label-sm text-label-sm mb-1 uppercase tracking-wider">Created by You</p>
              <p className="text-headline-md font-headline-md text-on-surface">{createdByMe}</p>
            </div>
            <div className="bg-surface-container border border-outline-variant p-4 rounded-xl">
              <p className="text-on-surface-variant font-label-sm text-label-sm mb-1 uppercase tracking-wider">Most Active</p>
              <p className="text-body-lg font-body-lg text-primary font-semibold truncate">{getMostActiveRoomName()}</p>
            </div>
          </div>

          {/* Filter Sticky Bar */}
          <div className="sticky top-12 z-30 bg-background/80 backdrop-blur-md py-4 mb-6 border-b border-outline-variant/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none transition-colors group-focus-within:text-primary">search</span>
                  <input 
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-10 pr-4 py-2 font-body-md text-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface" 
                    placeholder="Search rooms by name or ID..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant">
                  <button 
                    className={`p-1.5 rounded transition-all material-symbols-outlined ${viewMode === 'list' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                    onClick={() => setViewMode('list')}
                  >
                    list
                  </button>
                  <button 
                    className={`p-1.5 rounded transition-all material-symbols-outlined ${viewMode === 'grid' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    grid_view
                  </button>
                </div>
                <div className="relative">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="appearance-none bg-surface-container border border-outline-variant rounded-lg px-4 py-2 pr-10 font-label-sm text-label-sm text-on-surface focus:outline-none cursor-pointer hover:bg-surface-variant transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="most-active">Most Active</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">expand_more</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button 
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm border transition-all ${filterTab === 'all' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
              >
                All Rooms
              </button>
              <button 
                onClick={() => setFilterTab('active')}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm border transition-all ${filterTab === 'active' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setFilterTab('inactive')}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm border transition-all ${filterTab === 'inactive' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
              >
                Inactive
              </button>
              <button 
                onClick={() => setFilterTab('me')}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm border transition-all ${filterTab === 'me' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
              >
                Created by Me
              </button>
              <button 
                onClick={() => setFilterTab('joined')}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm border transition-all ${filterTab === 'joined' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
              >
                Joined
              </button>
              <button 
                onClick={() => setFilterTab('favorites')}
                className={`px-3 py-1 rounded-full text-label-sm font-label-sm border transition-all ${filterTab === 'favorites' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline-variant hover:border-primary/50'}`}
              >
                Favorites ⭐
              </button>
            </div>
          </div>

          {/* View Container */}
          <div className="relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-70">
                <span className="material-symbols-outlined animate-spin text-[36px] mb-4">sync</span>
                <p className="font-body-lg text-body-lg">Loading rooms history...</p>
              </div>
            ) : sortedRooms.length === 0 ? (
              <div className="bg-surface-container border border-outline-variant rounded-xl p-12 text-center text-on-surface-variant opacity-70">
                <span className="material-symbols-outlined text-[48px] mb-2 text-primary opacity-60">history</span>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-2">No Rooms Found</h4>
                <p className="font-body-md text-body-md max-w-md mx-auto">We couldn't find any rooms matching your search queries or filter tags. Create a new room to get started!</p>
                <Link to="/dashboard" className="inline-flex items-center gap-2 mt-6 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-semibold text-label-sm hover:opacity-90 active:scale-95 transition-all no-underline">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create Room
                </Link>
              </div>
            ) : viewMode === 'list' ? (
              /* List View */
              <div className="block overflow-x-auto">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="px-4 py-2 font-medium">Room Name</th>
                      <th className="px-4 py-2 font-medium">Language</th>
                      <th className="px-4 py-2 font-medium">Participants</th>
                      <th className="px-4 py-2 font-medium">Last Active</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRooms.map((room) => {
                      const isFav = favorites.includes(room.roomId);
                      return (
                        <tr 
                          key={room.roomId}
                          className={`bg-surface-container hover:bg-surface-variant/50 transition-colors group relative cursor-pointer ${!room.isActive ? 'opacity-65 hover:opacity-100' : ''}`}
                          onClick={() => navigate(`/room/${room.roomId}`)}
                        >
                          <td className="px-4 py-4 rounded-l-xl">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-body-lg text-body-lg font-semibold text-on-surface group-hover:text-primary transition-colors">
                                  {room.name}
                                </span>
                                {isFav && <span className="text-tertiary text-[16px] material-symbols-outlined fill-1">star</span>}
                              </div>
                              <span className="font-code-md text-code-md text-[11px] text-on-surface-variant">ID: {room.roomId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase font-code-md ${getLanguageBadgeStyles(room.language)}`}>
                              {room.language}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {room.participants?.length > 0 ? (
                              <div className="flex -space-x-2">
                                {room.participants.slice(0, 3).map((p) => {
                                  const colors = getAvatarStyles(p.username);
                                  return (
                                    <div 
                                      key={p._id}
                                      title={p.username}
                                      className={`w-7 h-7 rounded-full border-2 border-surface-container flex items-center justify-center text-[10px] font-bold ${colors.bg} ${colors.text}`}
                                    >
                                      {p.username.charAt(0).toUpperCase()}
                                    </div>
                                  );
                                })}
                                {room.participants.length > 3 && (
                                  <div className="w-7 h-7 rounded-full border-2 border-surface-container bg-surface-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                                    +{room.participants.length - 3}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-on-surface-variant text-[12px] font-code-md">0 online</span>
                            )}
                          </td>
                          <td className="px-4 py-4 font-body-md text-body-md text-on-surface-variant">
                            {formatRelativeTime(room.updatedAt)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${room.isActive ? 'bg-secondary' : 'bg-outline'}`}></span>
                              <span className={`font-label-sm text-label-sm font-semibold ${room.isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                                {room.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 rounded-r-xl text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2 relative">
                              <button 
                                onClick={() => navigate(`/room/${room.roomId}`)}
                                className={`font-label-sm text-label-sm px-4 py-1.5 rounded font-semibold transition-all ${room.isActive ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant hover:text-on-surface'}`}
                              >
                                {room.isActive ? 'Join' : 'View'}
                              </button>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === room.roomId ? null : room.roomId);
                                }}
                                className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors material-symbols-outlined border-none bg-transparent cursor-pointer rounded"
                              >
                                more_vert
                              </button>

                              {activeMenuId === room.roomId && (
                                <div className="absolute right-0 top-10 bg-surface-container-high border border-outline-variant rounded-lg py-1 shadow-2xl z-50 w-44 text-left">
                                  <button
                                    onClick={() => navigate(`/room/${room.roomId}`)}
                                    className="w-full px-4 py-2 hover:bg-surface-variant text-body-md font-body-md text-on-surface flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">{room.isActive ? 'login' : 'visibility'}</span>
                                    {room.isActive ? 'Join Room' : 'View Room'}
                                  </button>
                                  <button
                                    onClick={(e) => copyRoomId(room.roomId, e)}
                                    className="w-full px-4 py-2 hover:bg-surface-variant text-body-md font-body-md text-on-surface flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                                    Copy Room ID
                                  </button>
                                  <button
                                    onClick={(e) => toggleFavorite(room.roomId, e)}
                                    className="w-full px-4 py-2 hover:bg-surface-variant text-body-md font-body-md text-on-surface flex items-center gap-2 border-none bg-transparent cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">{isFav ? 'star_half' : 'star'}</span>
                                    {isFav ? 'Unfavorite' : 'Favorite'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedRooms.map((room) => {
                  const isFav = favorites.includes(room.roomId);
                  return (
                    <div 
                      key={room.roomId}
                      onClick={() => navigate(`/room/${room.roomId}`)}
                      className={`bg-surface-container border border-outline-variant rounded-xl p-5 hover:border-primary transition-all flex flex-col group relative cursor-pointer ${!room.isActive ? 'opacity-65 hover:opacity-100' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase font-code-md ${getLanguageBadgeStyles(room.language)}`}>
                          {room.language}
                        </span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleFavorite(room.roomId)}
                            className="p-1 text-on-surface-variant hover:text-tertiary transition-colors border-none bg-transparent cursor-pointer rounded"
                          >
                            <span className={`text-[18px] material-symbols-outlined ${isFav ? 'text-tertiary fill-1' : ''}`}>
                              {isFav ? 'star' : 'star_border'}
                            </span>
                          </button>
                          
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${room.isActive ? 'bg-secondary' : 'bg-outline'}`}></span>
                            <span className={`text-[10px] uppercase font-bold ${room.isActive ? 'text-secondary' : 'text-on-surface-variant'}`}>
                              {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-headline-md text-headline-md text-on-surface mb-1 group-hover:text-primary transition-colors">
                        {room.name}
                      </h3>
                      <p className="font-code-md text-code-md text-[11px] text-on-surface-variant mb-4">ID: {room.roomId}</p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/30">
                        {room.participants?.length > 0 ? (
                          <div className="flex -space-x-1.5">
                            {room.participants.slice(0, 3).map((p) => {
                              const colors = getAvatarStyles(p.username);
                              return (
                                <div 
                                  key={p._id}
                                  title={p.username}
                                  className={`w-6 h-6 rounded-full border border-surface-container flex items-center justify-center text-[9px] font-bold ${colors.bg} ${colors.text}`}
                                >
                                  {p.username.charAt(0).toUpperCase()}
                                </div>
                              );
                            })}
                            {room.participants.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-surface-variant flex items-center justify-center text-[8px] font-bold text-on-surface-variant">
                                +{room.participants.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-code-md text-on-surface-variant italic">0 online</span>
                        )}
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/room/${room.roomId}`);
                          }}
                          className={`font-label-sm text-label-sm px-4 py-1.5 rounded font-semibold active:scale-95 transition-all ${room.isActive ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-variant text-on-surface-variant hover:bg-outline-variant hover:text-on-surface'}`}
                        >
                          {room.isActive ? 'Join' : 'View'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Floating Action Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="fixed bottom-margin-desktop right-margin-desktop w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group z-50 border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[28px] group-hover:rotate-90 transition-transform">add</span>
          <div className="absolute right-full mr-4 bg-surface-container border border-outline-variant px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-label-sm font-label-sm text-on-surface">
            Create New Room
          </div>
        </button>

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

export default History;
