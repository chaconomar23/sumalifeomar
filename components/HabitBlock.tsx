import React from 'react';
import { Habit, HabitType } from '../types';
import { HABIT_CATEGORIES } from '../constants';

interface HabitBlockProps {
  habit: Habit;
}

const ClockIcon = (props: { className?: string }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const CheckIcon = (props: { className?: string }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const HashIcon = (props: { className?: string }) => (
     <svg {...props} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
);


const HabitBlock: React.FC<HabitBlockProps> = ({ habit }) => {
  const categoryStyle = HABIT_CATEGORIES[habit.category];
  const isDraggable = habit.type === HabitType.TIMED;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('newHabitId', habit.id);
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      className={`relative p-3 rounded-lg flex flex-col justify-between ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default opacity-80'} ${categoryStyle.bgColor}`}
    >
      <div className="pr-4">
        <h4 className="font-semibold text-white text-sm">{habit.name}</h4>
        {habit.type === HabitType.TIMED && <p className="text-xs text-gray-400">{habit.duration} min</p>}
        {habit.type === HabitType.COUNTER && <p className="text-xs text-gray-400">{habit.goal} veces</p>}
      </div>
       <div className="absolute top-2 right-2 text-gray-400">
        {habit.type === HabitType.TIMED && <ClockIcon />}
        {habit.type === HabitType.CHECK_IN && <CheckIcon />}
        {habit.type === HabitType.COUNTER && <HashIcon />}
      </div>
      <p className={`text-xs font-medium mt-2 ${categoryStyle.color}`}>{habit.category}</p>
    </div>
  );
};

export default HabitBlock;