import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function DebugOverlay() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollRef = useRef(null);

    // Global reference for old console methods
    const originalLog = useRef(console.log);
    const originalError = useRef(console.error);
    const originalWarn = useRef(console.warn);

    useEffect(() => {
        // Intercept logs
        const addLog = (type, args) => {
            const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            setLogs(prev => [...prev.slice(-100), {
                id: Date.now() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                type,
                message
            }]);
        };

        console.log = (...args) => {
            originalLog.current.apply(console, args);
            addLog('log', args);
        };
        console.error = (...args) => {
            originalError.current.apply(console, args);
            addLog('error', args);
        };
        console.warn = (...args) => {
            originalWarn.current.apply(console, args);
            addLog('warn', args);
        };

        // Shortcut listener
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            console.log = originalLog.current;
            console.error = originalError.current;
            console.warn = originalWarn.current;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isOpen, isMinimized]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none flex flex-col items-end">
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900/95 backdrop-blur-md w-[400px] h-[500px] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col pointer-events-auto mb-2"
                    >
                        {/* Header */}
                        <div className="p-3 bg-white/5 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sofofa-lightBlue font-bold text-xs uppercase tracking-wider">
                                <Terminal size={14} />
                                <span>Sistema de Logs Live</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setLogs([])}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                                    title="Limpiar"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <button 
                                    onClick={() => setIsMinimized(true)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                                >
                                    <ChevronDown size={14} />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Logs Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 selection:bg-sofofa-blue/30"
                        >
                            {logs.length === 0 && (
                                <div className="text-gray-500 italic text-center py-20">
                                    Esperando logs...
                                </div>
                            )}
                            {logs.map((log) => (
                                <div key={log.id} className="border-l-2 pl-2 border-white/5 group">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[10px] text-gray-500 font-bold">{log.timestamp}</span>
                                        <span className={`
                                            px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter
                                            ${log.type === 'error' ? 'bg-red-500/20 text-red-400' : ''}
                                            ${log.type === 'warn' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                            ${log.type === 'log' ? 'bg-blue-500/20 text-blue-400' : ''}
                                            ${log.message.includes('isSimulated": true') ? 'bg-purple-500/40 text-purple-200 border border-purple-400/50' : ''}
                                        `}>
                                            {log.type} {log.message.includes('isSimulated": true') ? ' (SIMULADO)' : ''}
                                        </span>
                                    </div>
                                    <pre className={`
                                        whitespace-pre-wrap break-all break-words
                                        ${log.type === 'error' ? 'text-red-300' : 'text-gray-300'}
                                        ${log.type === 'warn' ? 'text-yellow-200' : ''}
                                        ${log.message.includes('isSimulated": true') ? 'text-purple-200 font-bold' : ''}
                                    `}>
                                        {log.message}
                                    </pre>
                                </div>
                            ))}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-2 bg-black/20 text-[9px] text-gray-500 text-center">
                            Shift + Ctrl + L para cerrar | Logs limitados a los últimos 100
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle / Minimized Pill */}
            <motion.button
                layout
                onClick={() => isMinimized ? setIsMinimized(false) : setIsOpen(prev => !prev)}
                className="pointer-events-auto bg-sofofa-blue text-white px-4 py-2 rounded-full shadow-lg font-bold text-xs flex items-center gap-2 hover:bg-blue-600 transition-colors"
            >
                <Terminal size={14} />
                {isMinimized ? "Ver Logs" : "Debug Mode"}
                {logs.filter(l => l.id > Date.now() - 5000 && l.type === 'error').length > 0 && (
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                )}
            </motion.button>
        </div>
    );
}
