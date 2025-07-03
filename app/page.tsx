"use client";

export default function Home() {
  return (
    <div className="min-h-screen flex bg-[#ede8e6]">
      {/* Sidebar */}
      <aside className="w-80 bg-[#ede8e6] p-8 flex flex-col gap-8 border-r border-[#e0dbd7]">
        {/* Logo */}
        <div className="text-4xl font-bold mb-4">logo</div>
        {/* Create Dashboard Button */}
        <button className="bg-blue-600 text-white text-lg font-semibold rounded-xl py-5 px-6 mb-8 shadow-md hover:bg-blue-700 transition">
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
        <div className="bg-white rounded-xl p-5 flex flex-col gap-2 shadow w-full max-w-xs">
          <div className="text-xs font-bold text-gray-700 mb-2">CONNECT</div>
          <div className="flex items-center gap-3">
            {/* Placeholder cube icon */}
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="3"
                stroke="#222"
                strokeWidth="2"
              />
              <path d="M4 8l8 4 8-4" stroke="#222" strokeWidth="2" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              Data Source
            </span>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-12">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-12 mt-2 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">
            What can I build for you?
          </h1>
          {/* Input Box */}
          <div className="w-full bg-[#f7f7f7] rounded-xl flex items-center px-6 py-4 mb-8 border border-gray-200">
            <input
              type="text"
              placeholder="Build a table to see all my students list"
              className="flex-1 bg-transparent outline-none text-gray-700 text-lg placeholder-gray-400"
            />
            {/* Dropdown */}
            <select className="ml-4 px-3 py-1 rounded-full border border-gray-300 text-base font-medium shadow-sm">
              <option>ChatGPT</option>
            </select>
            {/* Send Button */}
            <button className="ml-4 bg-black text-white rounded-full p-2 hover:bg-gray-800 transition">
              {/* Paper plane icon */}
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M3 20l18-8-18-8v6l12 2-12 2v6z" fill="currentColor" />
              </svg>
            </button>
          </div>
          {/* Suggestions */}
          <div className="w-full flex gap-6 justify-center">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#f7f7f7] rounded-xl p-6 flex flex-col items-start w-72 shadow"
              >
                <div className="font-bold text-md mb-2">
                  Customer Behavior Analysis
                </div>
                <ul className="text-sm text-gray-700 mb-6 list-disc list-inside">
                  <li>Purchase history</li>
                  <li>Browsing patterns</li>
                  <li>Click-through rates (CTR)</li>
                  <li>Demographics</li>
                  <li>Session duration</li>
                </ul>
                <button className="bg-blue-600 text-white rounded-lg px-4 py-2 font-semibold text-sm hover:bg-blue-700 transition">
                  Use This Suggestion
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
