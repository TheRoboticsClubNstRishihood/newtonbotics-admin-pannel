'use client';

import { useState } from 'react';
import { HeartIcon, ArrowTopRightOnSquareIcon, BuildingOfficeIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

export default function DeveloperCredit() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border-t border-slate-600/50 shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-3 left-4 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
        <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-100"></div>
        <div className="absolute bottom-4 left-8 w-1 h-1 bg-indigo-300 rounded-full animate-pulse delay-200"></div>
        <div className="absolute bottom-6 right-4 w-1.5 h-1.5 bg-cyan-300 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/2 left-2 w-1 h-1 bg-pink-300 rounded-full animate-pulse delay-500"></div>
        <div className="absolute top-1/3 right-2 w-1 h-1 bg-emerald-300 rounded-full animate-pulse delay-700"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '15px 15px'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative p-2">
        {/* Main Message */}
        <div className="relative space-y-2">
          {/* First Row: Made with Love By */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-slate-200 font-medium drop-shadow-sm">Made with</span>
              <HeartIcon className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-sm text-slate-200 font-medium drop-shadow-sm">By</span>
            </div>
          </div>

          {/* Second Row: Monu Rajj */}
          <div className="text-center">
            <h3 className="text-base font-bold text-white transition-all duration-300 drop-shadow-sm">
              Monu Rajj {" "}
              <span className="text-[10px] text-yellow-200 mt-1 drop-shadow-sm">
  Under
</span>

            </h3>
          </div>

          {/* Third Row: MWS (Monadnocks Web Service) - Clickable */}
          <div className="text-center relative z-10">
            <a 
              href="https://monadnocks.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block w-full bg-gradient-to-r from-indigo-600 to-purple-600 backdrop-blur-sm border border-indigo-400 rounded-md px-3 py-2 hover:from-indigo-500 hover:to-purple-500 hover:border-indigo-300 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl relative z-20"
            >
              <div className="flex items-center justify-center space-x-2">
                <BuildingOfficeIcon className="w-4 h-4 text-white group-hover:text-indigo-100 transition-colors" />
                <div className="text-center">
                  <div className="text-sm font-bold text-white group-hover:text-white transition-colors drop-shadow-sm">
                    MWS
                  </div>
                  <div className="text-xs text-indigo-100 group-hover:text-white transition-colors">
                    (Monadnocks Web Service)
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-3 h-3 text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-200" />
              </div>
            </a>
          </div>

          {/* Contact Section */}
          <div className={`transition-all duration-1000 delay-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <EnvelopeIcon className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-slate-200 font-medium drop-shadow-sm">For Urgency:</span>
              </div>
              <a 
                href="mailto:monu2feb2004@gmail.com"
                className="text-xs text-blue-300 hover:text-blue-200 transition-colors drop-shadow-sm underline decoration-dotted underline-offset-2"
              >
                monu2feb2004@gmail.com
              </a>
            </div>
          </div>

          {/* Tech Stack Indicators */}
          <div className={`flex justify-center space-x-1 mt-1 transition-all duration-1000 delay-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-1 h-1 bg-pink-500 rounded-full animate-pulse delay-200"></div>
            <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"></div>
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 transition-opacity duration-500 z-0 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
    </div>
  );
}