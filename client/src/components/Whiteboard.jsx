import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Stage, Layer, Line } from 'react-konva';
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi';
import { BsEraserFill } from 'react-icons/bs';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import './Whiteboard.css';

const Whiteboard = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [tool, setTool] = useState('pen');
    const [lines, setLines] = useState([]);
    const [color, setColor] = useState('#ff7700');
    const [strokeWidth, setStrokeWidth] = useState(5);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [activeUsers, setActiveUsers] = useState(0);
    const [copied, setCopied] = useState(false);

    const isDrawing = useRef(false);
    const ydocRef = useRef(null);
    const providerRef = useRef(null);
    const yLinesRef = useRef(null);
    const undoManagerRef = useRef(null);
    const stageRef = useRef(null);

    useEffect(() => {
        // Initialize Yjs document
        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        // Get or create shared array for lines
        const yLines = ydoc.getArray('lines');
        yLinesRef.current = yLines;

        // Initialize UndoManager
        const undoManager = new Y.UndoManager(yLines);
        undoManagerRef.current = undoManager;

        // Connect to WebSocket server
        const serverUrl = import.meta.env.VITE_SERVER_URL
            ? import.meta.env.VITE_SERVER_URL
            : 'ws://localhost:3002';

        const provider = new WebsocketProvider(serverUrl, id, ydoc);
        providerRef.current = provider;

        // Listen for connection status
        provider.on('status', ({ status }) => {
            console.log('Connection status:', status);
            setConnectionStatus(status);
        });

        // Sync awareness (active users)
        provider.awareness.on('change', () => {
            const userCount = provider.awareness.getStates().size;
            setActiveUsers(userCount);
        });

        // Set local awareness state
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        provider.awareness.setLocalStateField('user', {
            name: 'User-' + Math.floor(Math.random() * 1000),
            color: randomColor
        });

        // Listen for changes to the shared array
        const updateLines = () => {
            const newLines = yLines.toArray();
            setLines(newLines);
        };

        yLines.observe(updateLines);
        updateLines(); // Initial load

        return () => {
            yLines.unobserve(updateLines);
            provider.destroy();
            ydoc.destroy();
        };
    }, [id]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return; // Ignore if typing in an input

            // Undo: Ctrl+Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoManagerRef.current?.undo();
            }
            // Redo: Ctrl+Y or Ctrl+Shift+Z
            if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                undoManagerRef.current?.redo();
            }
            // Tools
            if (e.key.toLowerCase() === 'p') setTool('pen');
            if (e.key.toLowerCase() === 'e') setTool('eraser');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleMouseDown = (e) => {
        if (!yLinesRef.current) return;
        isDrawing.current = true;
        const pos = e.target.getStage().getPointerPosition();
        yLinesRef.current.push([{ tool, points: [pos.x, pos.y], color, strokeWidth }]);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing.current || !yLinesRef.current) return;
        const stage = e.target.getStage();
        const point = stage.getPointerPosition();
        const currentLines = yLinesRef.current.toArray();
        const lastLine = currentLines[currentLines.length - 1];

        if (lastLine) {
            const updatedLine = { ...lastLine, points: lastLine.points.concat([point.x, point.y]) };
            yLinesRef.current.delete(currentLines.length - 1, 1);
            yLinesRef.current.push([updatedLine]);
        }
    };

    const handleMouseUp = () => {
        isDrawing.current = false;
    };

    const handleBack = async () => {
        // Capture thumbnail
        if (stageRef.current) {
            try {
                // Use explicit connection url
                const serverUrl = import.meta.env.VITE_SERVER_URL
                    ? import.meta.env.VITE_SERVER_URL.replace('ws', 'http')
                    : 'http://localhost:3002';

                // Temporarily unscale stage if needed, but for thumbnail standard is fine
                const dataUrl = stageRef.current.toDataURL({ pixelRatio: 0.5 }); // Medium res for better quality

                await fetch(`${serverUrl}/api/whiteboards/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ thumbnail: dataUrl })
                });
            } catch (err) {
                console.error("Failed to save thumbnail", err);
            }
        }
        navigate('/home');
    };

    const handleCopyRoomKey = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleClear = () => {
        if (yLinesRef.current) {
            yLinesRef.current.delete(0, yLinesRef.current.length);
        }
    };

    return (
        <div className="whiteboard-container">
            {/* Back Button */}
            <button className="back-btn" onClick={handleBack}>
                <FiArrowLeft size={24} />
                <span>Back</span>
            </button>

            {/* Connection Status */}
            <div className="status-bar">
                <div className={`connection-status ${connectionStatus}`}>
                    <span className="status-dot"></span>
                    {connectionStatus === 'connected' ? 'Connected' :
                        connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
                </div>
                <div className="active-users">
                    {activeUsers} {activeUsers === 1 ? 'user' : 'users'} online
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="tool-section">
                    <button
                        className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
                        onClick={() => setTool('pen')}
                        title="Pen (P)"
                    >
                        <FiEdit2 size={20} />
                    </button>
                    <button
                        className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                        onClick={() => setTool('eraser')}
                        title="Eraser (E)"
                    >
                        <BsEraserFill size={20} />
                    </button>
                </div>

                <div className="tool-section">
                    <label>Color:</label>
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="color-picker"
                    />
                </div>

                <div className="tool-section">
                    <label>Size:</label>
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        className="stroke-slider"
                    />
                    <span className="stroke-value">{strokeWidth}px</span>
                </div>

                <button className="clear-btn" onClick={handleClear}>
                    Clear Canvas
                </button>
            </div>

            {/* Canvas */}
            <Stage
                ref={stageRef}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseDown={handleMouseDown}
                onMousemove={handleMouseMove}
                onMouseup={handleMouseUp}
                className="canvas-stage"
            >
                <Layer>
                    {lines.map((line, i) => (
                        <Line
                            key={i}
                            points={line.points}
                            stroke={line.tool === 'eraser' ? '#1c1c1c' : line.color}
                            strokeWidth={line.strokeWidth}
                            tension={0.5}
                            lineCap="round"
                            lineJoin="round"
                            globalCompositeOperation={
                                line.tool === 'eraser' ? 'destination-out' : 'source-over'
                            }
                        />
                    ))}
                </Layer>
            </Stage>

            {/* Room Key Display */}
            <div className="room-key-container">
                <div className="room-key-label">Room Key:</div>
                <div className="room-key-value">{id}</div>
                <button
                    className="copy-key-btn"
                    onClick={handleCopyRoomKey}
                    title="Copy room key"
                >
                    {copied ? '✓ Copied!' : 'Copy'}
                </button>
            </div>
        </div>
    );
};

export default Whiteboard;
