"use client";

import { useState, useEffect } from "react";

export interface ConnectionDetails {
  dbName: string;
  dbType: string;
  host: string;
  port: string;
  username: string;
  password?: string;
}

interface ConnectionModalProps {
  onClose: () => void;
  onConnect: (details: ConnectionDetails) => void;
  initialData?: ConnectionDetails;
}

export default function ConnectionModal({
  onClose,
  onConnect,
  initialData,
}: ConnectionModalProps) {
  const [dbName, setDbName] = useState(initialData?.dbName || "");
  const [dbType, setDbType] = useState(initialData?.dbType || "PostgreSQL");
  const [host, setHost] = useState(initialData?.host || "");
  const [port, setPort] = useState(initialData?.port || "");
  const [username, setUsername] = useState(initialData?.username || "");
  const [password, setPassword] = useState(initialData?.password || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setDbName(initialData.dbName);
      setDbType(initialData.dbType);
      setHost(initialData.host);
      setPort(initialData.port);
      setUsername(initialData.username);
      setPassword(initialData.password || "");
    }
  }, [initialData]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError("");

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbName, dbType, host, port, username, password }),
      });

      if (response.ok) {
        const detailsToSend = { dbName, dbType, host, port, username, password };
        console.log("ConnectionModal: Sending details to onConnect", detailsToSend);
        onConnect(detailsToSend);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to connect");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-black">
          Connect to Database
        </h2>

        <select
          className="w-full p-3 border rounded mb-4 bg-gray-50 text-black"
          value={dbType}
          onChange={(e) => setDbType(e.target.value)}
        >
          <option>PostgreSQL</option>
          <option>MySQL</option>
          <option>Microsoft SQL Server</option>
        </select>

        <input
          type="text"
          placeholder="Database Name"
          className="w-full p-3 border rounded mb-4 text-black"
          value={dbName}
          onChange={(e) => setDbName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Host"
          className="w-full p-3 border rounded mb-4 text-black"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        />
        <input
          type="text"
          placeholder="Port"
          className="w-full p-3 border rounded mb-4 text-black"
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 border rounded mb-4 text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded mb-6 text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-600 font-semibold">
            Cancel
          </button>
          <button
            onClick={handleConnect}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
