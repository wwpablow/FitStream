/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Settings2, 
  ChevronRight, 
  ChevronLeft,
  Youtube,
  Tv,
  ExternalLink,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Exercise {
  id: string;
  name: string;
  duration: number; // in seconds
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: 'Fish Face', duration: 30 },
  { id: '2', name: 'Lip Press', duration: 30 },
  { id: '3', name: 'Neck Stretch', duration: 45 },
  { id: '4', name: 'Head Rolls', duration: 30 },
];

export default function App() {
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/dQw4w9WgXcQ');
  const [inputUrl, setInputUrl] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_EXERCISES[0].duration);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle Timer Logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleNext();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(exercises[currentIndex].duration);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimeLeft(exercises[nextIndex].duration);
    } else {
      setIsActive(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setTimeLeft(exercises[prevIndex].duration);
    }
  };

  const updateVideo = () => {
    let finalUrl = inputUrl;
    if (inputUrl.includes('youtube.com/watch?v=')) {
      const id = inputUrl.split('v=')[1].split('&')[0];
      finalUrl = `https://www.youtube.com/embed/${id}`;
    } else if (inputUrl.includes('youtu.be/')) {
      const id = inputUrl.split('youtu.be/')[1].split('?')[0];
      finalUrl = `https://www.youtube.com/embed/${id}`;
    }
    setVideoUrl(finalUrl);
  };

  const addExercise = () => {
    const newEx: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Move',
      duration: 30
    };
    setExercises([...exercises, newEx]);
  };

  const removeExercise = (id: string) => {
    const filtered = exercises.filter(ex => ex.id !== id);
    if (filtered.length === 0) return;
    setExercises(filtered);
    if (currentIndex >= filtered.length) {
      setCurrentIndex(filtered.length - 1);
      setTimeLeft(filtered[filtered.length - 1].duration);
    }
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    const updated = exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    );
    setExercises(updated);
    if (exercises[currentIndex].id === id && field === 'duration') {
      setTimeLeft(value as number);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-emerald-100">
      {/* Header / URL Input */}
      <header className="bg-white border-b border-stone-200 px-4 lg:px-6 py-3 lg:py-4 flex flex-wrap items-center justify-between sticky top-0 z-50 gap-3">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-emerald-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Play size={16} fill="currentColor" className="lg:hidden" />
            <Play size={20} fill="currentColor" className="hidden lg:block" />
          </div>
          <h1 className="text-lg lg:text-xl font-semibold tracking-tight">FitStream</h1>
        </div>
        
        <div className="order-3 lg:order-2 w-full lg:flex-1 lg:max-w-2xl flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Paste YouTube link..." 
              className="w-full bg-stone-100 border-none rounded-lg px-3 lg:px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && updateVideo()}
            />
          </div>
          <button 
            onClick={updateVideo}
            className="bg-stone-900 text-white px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium hover:bg-stone-800 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            Load
          </button>
        </div>

        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`order-2 lg:order-3 p-2 rounded-lg transition-colors ${showSettings ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-stone-100 text-stone-500'}`}
        >
          <Settings2 size={20} />
        </button>
      </header>

      <main className="flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
        {/* Left: Video Player */}
        <div className="flex-1 bg-black relative group min-h-[300px] lg:min-h-0">
          <iframe 
            src={videoUrl}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups"
          />
        </div>

        {/* Right: Timer & Controls */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-stone-200 bg-white flex flex-col shadow-2xl overflow-y-auto lg:overflow-visible">
          {/* Current Exercise Display */}
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-2 text-stone-400 font-mono text-sm tracking-widest uppercase">
              Exercise {currentIndex + 1} of {exercises.length}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.h2 
                key={exercises[currentIndex].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-4xl font-bold mb-8 tracking-tight leading-tight"
              >
                {exercises[currentIndex].name}
              </motion.h2>
            </AnimatePresence>

            <div className="relative mb-8 lg:mb-12">
              <div className="text-6xl lg:text-8xl font-mono font-light tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
              </div>
              {/* Progress Ring (Simplified) */}
              <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] lg:w-[280px] lg:h-[280px] -rotate-90 opacity-10">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="lg:hidden"
                />
                <circle
                  cx="140"
                  cy="140"
                  r="130"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="hidden lg:block"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="565"
                  animate={{ strokeDashoffset: 565 * (1 - timeLeft / exercises[currentIndex].duration) }}
                  className="text-emerald-500 opacity-100 lg:hidden"
                />
                <motion.circle
                  cx="140"
                  cy="140"
                  r="130"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="816"
                  animate={{ strokeDashoffset: 816 * (1 - timeLeft / exercises[currentIndex].duration) }}
                  className="text-emerald-500 opacity-100 hidden lg:block"
                />
              </svg>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-3 rounded-full border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              
              <button 
                onClick={toggleTimer}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
                  isActive 
                  ? 'bg-stone-100 text-stone-900 hover:bg-stone-200' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200'
                }`}
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={handleNext}
                disabled={currentIndex === exercises.length - 1}
                className="p-3 rounded-full border border-stone-200 text-stone-400 hover:text-stone-900 hover:border-stone-900 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <button 
              onClick={resetTimer}
              className="mt-8 text-stone-400 hover:text-stone-900 flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <RotateCcw size={16} /> Reset Timer
            </button>
          </div>

          {/* Settings / Exercise List Overlay */}
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute inset-x-0 bottom-0 h-[70%] bg-white border-t border-stone-200 shadow-2xl z-40 flex flex-col"
              >
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Exercise Settings</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="text-stone-400 hover:text-stone-900"
                  >
                    Done
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {exercises.map((ex, idx) => (
                    <div key={ex.id} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-mono text-stone-500">
                        {idx + 1}
                      </div>
                      <input 
                        type="text" 
                        value={ex.name}
                        onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                        className="flex-1 bg-stone-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <div className="flex items-center gap-1 bg-stone-50 rounded-lg px-2">
                        <input 
                          type="number" 
                          value={ex.duration}
                          onChange={(e) => updateExercise(ex.id, 'duration', parseInt(e.target.value) || 0)}
                          className="w-12 bg-transparent border-none py-2 text-sm text-center focus:ring-0 outline-none"
                        />
                        <span className="text-xs text-stone-400 pr-2">s</span>
                      </div>
                      <button 
                        onClick={() => removeExercise(ex.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  
                  <button 
                    onClick={addExercise}
                    className="w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Plus size={18} /> Add New Exercise
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Quick Info Overlay (Optional) */}
      <div className="fixed bottom-6 left-6 flex gap-4">
        <div className="bg-white/80 backdrop-blur-md border border-stone-200 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg text-xs font-medium text-stone-600">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Active: {exercises[currentIndex].name}
        </div>
      </div>
    </div>
  );
}
