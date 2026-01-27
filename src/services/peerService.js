import Peer from 'peerjs';

class PeerService {
    constructor() {
        this.peer = null;
        this.conn = null; // Connection to host (if client) or generic ref
        this.connections = []; // List of connections (if host)
        this.callbacks = {};
    }

    initialize(id = null) {
        // CLEANUP PREVIOUS
        if (this.peer) this.peer.destroy();
        this.connections = [];

        // Create new Peer. 
        // We use a random ID if not provided, or custom logic.
        // PeerJS public server is free but has limits.
        this.peer = new Peer(id, {
            debug: 2
        });

        this.peer.on('open', (id) => {
            console.log('My ID:', id);
            if (this.callbacks.onOpen) this.callbacks.onOpen(id);
        });

        this.peer.on('connection', (conn) => {
            console.log('Incoming connection:', conn.peer);
            this.handleConnection(conn);
        });

        this.peer.on('error', (err) => {
            console.error(err);
            if (this.callbacks.onError) this.callbacks.onError(err);
        });
    }

    connect(hostId) {
        if (!this.peer) this.initialize();

        const conn = this.peer.connect(hostId);
        conn.on('open', () => {
            console.log('Connected to host:', hostId);
            this.conn = conn;
            if (this.callbacks.onConnect) this.callbacks.onConnect();

            // Listen for data
            conn.on('data', (data) => {
                if (this.callbacks.onData) this.callbacks.onData(data);
            });
        });

        conn.on('error', (err) => console.error("Connection Error", err));
    }

    handleConnection(conn) {
        this.connections.push(conn);

        conn.on('open', () => {
            console.log('Client connected:', conn.peer);
            if (this.callbacks.onClientConnect) this.callbacks.onClientConnect(conn.peer);
        });

        conn.on('data', (data) => {
            if (this.callbacks.onData) this.callbacks.onData(data, conn.peer);
        });

        conn.on('close', () => {
            this.connections = this.connections.filter(c => c !== conn);
            if (this.callbacks.onClientDisconnect) this.callbacks.onClientDisconnect(conn.peer);
        });
    }

    send(data) {
        // If Host: Broadcast to all
        if (this.connections.length > 0) {
            this.connections.forEach(conn => {
                if (conn.open) conn.send(data);
            });
        }
        // If Client: Send to Host
        else if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }

    // Setters for listeners
    on(event, callback) {
        this.callbacks[event] = callback;
    }
}

export const peerService = new PeerService();
