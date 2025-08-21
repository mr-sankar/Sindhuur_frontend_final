import React from "react";

export default function ResponsiveLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="w-full bg-white shadow p-4 sm:p-6 lg:px-12">
        <div className="max-w-screen-xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold whitespace-nowrap">Sindhuura</h1>
          <nav className="w-full sm:w-auto">
            <ul className="flex flex-wrap justify-center sm:justify-end gap-3 text-sm sm:text-base">
              <li><a href="#" className="hover:text-blue-600">Home</a></li>
              <li><a href="#" className="hover:text-blue-600">Services</a></li>
              <li><a href="#" className="hover:text-blue-600">Events</a></li>
              <li><a href="#" className="hover:text-blue-600">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition duration-300"
            >
              <h2 className="text-lg font-semibold">Card Title {i + 1}</h2>
              <p className="text-sm text-gray-600 mt-2">
                This card adapts perfectly to screen size. No overlaps, no mess.
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-4 px-4 sm:px-6 lg:px-12 mt-8">
        <div className="text-center text-xs sm:text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Sindhuura. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
