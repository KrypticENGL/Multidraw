import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { FiMenu, FiX, FiPlus, FiLogIn, FiTrash2 } from 'react-icons/fi';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [whiteboards, setWhiteboards] = useState([]);
    const [joinError, setJoinError] = useState('');
    const [showAccountModal, setShowAccountModal] = useState(false);

    useEffect(() => {
        if (!user) return;

        const fetchWhiteboards = async () => {
            // Use http protocol since we replaced ws logic only for the whiteboard provider
            const serverUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
            try {
                const res = await fetch(`${serverUrl}/api/whiteboards?userId=${user.uid}`);
                if (res.ok) {
                    const data = await res.json();
                    setWhiteboards(data);
                }
            } catch (err) {
                console.error("Failed to fetch boards", err);
            }
        };
        fetchWhiteboards();
    }, [user]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleJoinSession = async () => {
        if (!roomName.trim()) return;

        setJoinError('');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

        try {
            const response = await fetch(`${backendUrl}/api/whiteboards/${roomName.trim()}/exists`);

            if (response.ok) {
                // Whiteboard exists, navigate to it
                navigate(`/whiteboard/${roomName.trim()}`);
                setIsJoinModalOpen(false);
                setRoomName('');
                setIsSidebarOpen(false);
            } else {
                // Whiteboard doesn't exist
                setJoinError('Whiteboard not found. Please check the room name and try again.');
            }
        } catch (err) {
            console.error('Failed to check whiteboard:', err);
            setJoinError('Failed to connect. Please check your internet connection and try again.');
        }
    };

    const handleJoinClick = () => {
        // Check if user is anonymous before opening join modal
        if (user?.isAnonymous) {
            setShowAccountModal(true);
            setIsSidebarOpen(false);
            return;
        }
        setIsJoinModalOpen(true);
    };

    const handleCreateNewWhiteboard = async () => {
        if (!user) return;

        // Generate a unique room ID using timestamp and random string
        const uniqueId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

        // Create metadata in DB first
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
        try {
            await fetch(`${backendUrl}/api/whiteboards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: uniqueId,
                    name: 'Untitled Whiteboard',
                    ownerId: user.uid
                })
            });
            navigate(`/whiteboard/${uniqueId}`);
            setIsSidebarOpen(false);
        } catch (err) {
            console.error("Failed to create whiteboard", err);
            alert('Failed to create whiteboard. Please try again.');
        }
    };

    const handleDelete = async (e, roomId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this whiteboard?')) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
        try {
            const res = await fetch(`${backendUrl}/api/whiteboards/${roomId}`, { method: 'DELETE' });
            if (res.ok) {
                setWhiteboards(prev => prev.filter(board => board.roomId !== roomId));
            }
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const handleLogout = async () => {
        try {
            // If user is anonymous, delete all their whiteboards before logout
            if (user?.isAnonymous) {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';
                try {
                    // Delete all whiteboards owned by this anonymous user
                    const deletePromises = whiteboards.map(board =>
                        fetch(`${backendUrl}/api/whiteboards/${board.roomId}`, {
                            method: 'DELETE'
                        })
                    );
                    await Promise.all(deletePromises);
                    console.log('Anonymous user data cleaned up');
                } catch (err) {
                    console.error('Failed to cleanup anonymous user data:', err);
                }
            }

            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    if (!user) return null; // Or a loading spinner

    return (
        <div className="home-container">
            {/* Hamburger button - fixed position */}
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <FiMenu size={24} color="white" />
            </button>

            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>Multidraw</h1>
                </div>
                <div className="navbar-user">
                    <div className="user-info">
                        <img
                            src={user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                            alt="Profile"
                            className="profile-pic"
                        />
                        <span className="user-name">{user.displayName || user.email.split('@')[0]}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
                        <FiX size={24} />
                    </button>
                </div>
                <ul className="sidebar-menu">
                    <li className="menu-item" onClick={handleCreateNewWhiteboard}>
                        <FiPlus size={20} />
                        <span>New Whiteboard</span>
                    </li>
                    <li className="menu-item" onClick={handleJoinClick}>
                        <FiLogIn size={20} />
                        <span>Join Session</span>
                    </li>
                </ul>
            </div>

            {/* Overlay */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Join Session Modal */}
            {isJoinModalOpen && (
                <div className="modal-overlay" onClick={() => setIsJoinModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Join Session</h2>
                        <p>Enter the room name to join an existing whiteboard session</p>
                        {joinError && <div className="join-error">{joinError}</div>}
                        <input
                            type="text"
                            placeholder="Room Name"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleJoinSession()}
                            className="room-input"
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setIsJoinModalOpen(false)}>
                                Cancel
                            </button>
                            <button className="join-btn" onClick={handleJoinSession}>
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Requirement Modal */}
            {showAccountModal && (
                <div className="modal-overlay" onClick={() => setShowAccountModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Account Required</h2>
                        <p>You need to have an account to join any room</p>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowAccountModal(false)}>
                                Nevermind
                            </button>
                            <button className="join-btn" onClick={() => {
                                setShowAccountModal(false);
                                navigate('/');
                            }}>
                                Create One
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-content">
                <h2>Your Boards</h2>
                {whiteboards.length === 0 ? (
                    <div className="empty-state">
                        <p>No boards yet. Create one from the menu!</p>
                    </div>
                ) : (
                    <div className="whiteboard-grid">
                        {whiteboards.map((board) => (
                            <div key={board.roomId} className="whiteboard-card" onClick={() => navigate(`/whiteboard/${board.roomId}`)}>
                                <button className="delete-btn" onClick={(e) => handleDelete(e, board.roomId)} title="Delete Whiteboard">
                                    <FiTrash2 size={16} />
                                </button>
                                {board.thumbnail ? (
                                    <div className="card-preview">
                                        <img src={board.thumbnail} alt="Whiteboard Preview" />
                                    </div>
                                ) : (
                                    <div className="card-icon">
                                        <FiLogIn size={32} />
                                    </div>
                                )}
                                <div className="card-info">
                                    <h3>{board.name}</h3>
                                    <span className="card-date">{new Date(board.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
