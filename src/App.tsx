import React from 'react';
import { Navbar } from './components/Navbar';
import { FloodScrollytelling } from './components/FloodScrollytelling';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#030708] text-white">
      <Navbar />
      <main>
        <FloodScrollytelling />
      </main>
      <Footer />
    </div>
  );
};

export default App;
