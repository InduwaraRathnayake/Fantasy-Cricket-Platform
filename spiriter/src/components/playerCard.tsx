/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { FaInfoCircle } from "react-icons/fa";
import React from 'react';

/** Example category icons (replace with real images if desired) */
function getCategoryIcon(category: string) {
  switch (category) {
    case 'Batsman':
      return <img className='w-8 h-8' src="/images/cricbat.png" alt=""/>; // or a cricket bat icon
    case 'Bowler':
      return <img className='w-8 h-8' src="/images/cricket-ball.png" alt=""/>; // or a cricket ball icon
    case 'All-Rounder':
      return <img className='w-8 h-8' src="/images/allaround.png" alt=""/>; // or any star/all-rounder icon
    default:
      return '❓';
  }
}

export interface Player {
  _id: string;
  name: string;
  university: string;
  runs: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  category: 'Batsman' | 'Bowler' | 'All-Rounder';
  playerValue: number;
}

interface PlayerCardProps {
  player: Player;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const categoryIcon = getCategoryIcon(player.category);
  const [firstName, ...Lastname] = player.name.split(' ');

  return (
    <div className="relative w-full h-[300px] bg-white/10 text-white rounded-lg shadow-lg overflow-hidden flex flex-col items-center justify-center p-8">
      <div className="absolute top-4 left-4">
        <div className="relative group">
          {/* The plus icon */}
          <div className="bg-white/40 text-white rounded-full text-2xl flex items-center justify-center cursor-pointer">
          <FaInfoCircle />
          </div>

          {/* Hidden popup that appears on hover */}
          <div className="absolute left-6 top-0 bg-white/20 backdrop-blur-2xl text-white text-sm p-2 w-48 rounded shadow-md hidden group-hover:block z-10">
            <p>
              <strong>Runs:</strong> {player.runs}
            </p>
            <p>
              <strong>Balls Faced:</strong> {player.ballsFaced}
            </p>
            <p>
              <strong>Innings:</strong> {player.inningsPlayed}
            </p>
            <p>
              <strong>Wickets:</strong> {player.wickets}
            </p>
            <p>
              <strong>Overs Bowled:</strong> {player.oversBowled}
            </p>
            <p>
              <strong>Runs Conceded:</strong> {player.runsConceded}
            </p>
            <p>
              <strong>Value:</strong> {player.playerValue}
            </p>
          </div>
        </div>
      </div>

      {/* Top-right category icon */}
      <div className="absolute top-4 right-4">
        <div className="text-white w-8 h-8 flex items-center justify-center rounded">
          {categoryIcon}
        </div>
      </div>

      {/* Player Image */}
      <img
        src="/player.svg"
        alt="Player"
        className="w-24 h-24 rounded-full mb-2"
      />

      {/* Player name & university at the bottom */}
      <div className="text-center w-8/10 flex flex-col items-center">
        <div className="text-4xl font-bold text-cyan-300">{firstName}</div>
        <div className="text-lg font-semibold">{Lastname}</div>
        <div className="text-sm text-gray-300 mt-2">{player.university}</div>
      </div>
    </div>
  );

}
