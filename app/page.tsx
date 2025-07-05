"use client";

import { useState, useEffect } from "react";
import ConnectionModal, {
  ConnectionDetails,
} from "../components/ConnectionModal";
import DataTable from "../components/DataTable";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionDetails, setConnectionDetails] =
    useState<ConnectionDetails | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "none" | "connecting" | "connected" | "failed"
  >("none");
  const [connectionErrorMessage, setConnectionErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [schema, setSchema] = useState<any[]>([]);
  const [primaryKey, setPrimaryKey] = useState<string[]>([]);

  const handleConnect = (details: ConnectionDetails) => {
    setConnectionDetails(details);
    setConnectionStatus("connected");
    setConnectionErrorMessage("");
  };

  useEffect(() => {
    const fetchTables = async () => {
      if (!connectionDetails) return;

      setConnectionStatus("connecting");
      setConnectionErrorMessage("");
      try {
        const response = await fetch("/api/tables");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch tables.");
        }
        const tableNames = await response.json();
        setTables(tableNames);
        setConnectionStatus("connected");
      } catch (err) {
        setConnectionStatus("failed");
        setConnectionErrorMessage((err as Error).message);
      }
    };

    fetchTables();
  }, [connectionDetails]);

  

  const fetchSchema = async (tableName: string) => {
    try {
      const response = await fetch(`/api/schema?tableName=${tableName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch schema.");
      }
      const { columns, primaryKey } = await response.json();
      setSchema(columns);
      setPrimaryKey(primaryKey);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleQuery = async () => {
    if (!query) {
      console.log("Query is empty, not executing.");
      return;
    }

    console.log(`Executing query: ${query}`);
    setIsLoading(true);
    setError("");
    setData([]);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.log("API Query Response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Query Error Data:", errorData);
        throw new Error(errorData.message || "An error occurred");
      }

      const result = await response.json();
      console.log("API Query Result (Data):", result);
      setData(result);
    } catch (err) {
      console.error("Error during handleQuery:", err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      console.log(`Selected table changed to: ${selectedTable}`);
      setQuery(`SELECT * FROM ${selectedTable}`);
      fetchSchema(selectedTable);
      handleQuery(); // Automatically fetch data when table is selected
    }
  }, [selectedTable]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQuery();
  };

  return (
    <div className="min-h-screen flex bg-[#ede8e6]">
      {/* Sidebar */}
      <aside className="w-80 bg-[#ede8e6] p-8 flex flex-col gap-8 border-r border-[#e0dbd7]">
        {/* Logo */}
        <div className="text-4xl font-bold mb-4 text-black">logo</div>
        {/* Create Dashboard Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white text-lg font-semibold rounded-xl py-5 px-6 mb-8 shadow-md hover:bg-blue-700 transition"
        >
          Create new Dashboard
        </button>
        {/* My Dashboards */}
        <div className="mb-2">
          <div className="text-sm font-semibold text-gray-700 mb-1">
            My Dashboards
          </div>
          <div className="text-xs text-gray-400">Workspace Managements</div>
        </div>
        {/* Data Source Card */}
        <div
          className="bg-white rounded-xl p-5 flex flex-col gap-2 shadow w-full max-w-xs cursor-pointer"
          onClick={() => {
            if (connectionDetails) {
              setIsModalOpen(true);
            }
          }}
        >
          <div className="text-xs font-bold text-gray-700 mb-2">CONNECT</div>
          <div className="flex items-center gap-3">
            {/* Placeholder cube icon */}
            <svg
              height="20px"
              width="20px"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 32 32"
              xmlSpace="preserve"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <g>
                  {" "}
                  <g id="layers">
                    {" "}
                    <g>
                      {" "}
                      <polygon
                        style={{ fill: "#030104" }}
                        points="0,22 16,26 32,22 32,26 16,30 0,26 "
                      ></polygon>{" "}
                      <polygon
                        style={{ fill: "#030104" }}
                        points="0,14 16,18 32,14 32,18 16,22 0,18 "
                      ></polygon>{" "}
                      <polygon
                        style={{ fill: "#030104" }}
                        points="0,6 16,2 32,6 32,10 16,14 0,10 "
                      ></polygon>{" "}
                    </g>{" "}
                  </g>{" "}
                </g>{" "}
              </g>
            </svg>
            {connectionStatus === "connecting" ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Connecting...
                </span>
              </div>
            ) : connectionDetails ? (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {connectionDetails.dbName}
                </span>
                {connectionStatus === "connected" && (
                  <span className="text-sm font-bold text-green-600">
                    Connected
                  </span>
                )}
                {connectionStatus === "failed" && (
                  <span className="text-sm font-bold text-red-600">
                    Connection Failed
                  </span>
                )}
                {connectionErrorMessage && (
                  <span className="text-xs text-red-500">
                    {connectionErrorMessage}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-700">
                Data Source
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-12">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-12 mt-2 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-8">
            What can I build for you?
          </h1>
          {/* Input Box */}
          <form onSubmit={handleFormSubmit} className="w-full">
            <div className="w-full bg-[#f7f7f7] rounded-xl flex items-center px-6 py-4 mb-8 border border-gray-200">
              <input
                type="text"
                placeholder="e.g., SELECT * FROM customers"
                className="flex-1 bg-transparent outline-none text-gray-700 text-lg placeholder-gray-400"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={!connectionDetails || isLoading}
              />
              {/* Dropdown */}
              <select
                className="ml-4 px-3 py-1 rounded-full border border-gray-300 text-base font-medium shadow-sm"
                disabled={!connectionDetails || isLoading || !tables.length}
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
              {/* Send Button */}
              <button
                type="submit"
                className="ml-4 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition"
                disabled={!connectionDetails || isLoading}
              >
                {/* Paper plane icon */}
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M3 20l18-8-18-8v6l12 2-12 2v6z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </form>

          {isLoading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {data.length > 0 && (
            <DataTable
              data={data}
              columns={schema}
              primaryKey={primaryKey}
              tableName={selectedTable}
              onRefresh={handleQuery}
            />
          )}
        </div>
      </main>

      {isModalOpen && (
        <ConnectionModal
          onClose={() => setIsModalOpen(false)}
          onConnect={handleConnect}
          initialData={connectionDetails || undefined}
        />
      )}
    </div>
  );
}
