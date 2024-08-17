import React from 'react';

function Header() {
  return (
    <header className="bg-blue-900 text-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">iScrape 🕵️</h1>
        {/* <nav className="mt-2">
          <a href="/" className="mr-4 hover:underline">Home</a>
          <a href="/about" className="hover:underline">About</a>
        </nav> */}
      </div>
    </header>
  );
}

export default Header;
