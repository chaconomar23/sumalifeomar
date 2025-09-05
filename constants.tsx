import React from 'react';
import { HabitCategory, NavItem } from './types';

// Icons
const HomeIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const ClipboardListIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
  </svg>
);
const BookOpenIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ChartBarIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);
const SettingsIcon = (props: { className?: string }) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.22l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.22l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
export const PlusIcon = (props: { className?: string }) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);


export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: HomeIcon },
  { path: '/routines', label: 'Rutinas', icon: ClipboardListIcon },
  { path: '/academics', label: 'Académico', icon: BookOpenIcon },
  { path: '/statistics', label: 'Estadísticas', icon: ChartBarIcon },
  { path: '/settings', label: 'Ajustes', icon: SettingsIcon },
];

export const HABIT_CATEGORIES: { [key in HabitCategory]: { color: string; bgColor: string; hex: string; } } = {
  [HabitCategory.MIND]: { color: 'text-blue-300', bgColor: 'bg-blue-900/50', hex: '#93c5fd' },
  [HabitCategory.BODY]: { color: 'text-red-300', bgColor: 'bg-red-900/50', hex: '#fca5a5' },
  [HabitCategory.HEALTH]: { color: 'text-green-300', bgColor: 'bg-green-900/50', hex: '#86efac' },
  [HabitCategory.SPIRITUALITY]: { color: 'text-purple-300', bgColor: 'bg-purple-900/50', hex: '#d8b4fe' },
  [HabitCategory.FINANCES]: { color: 'text-yellow-300', bgColor: 'bg-yellow-900/50', hex: '#fde047' },
  [HabitCategory.SOCIAL]: { color: 'text-pink-300', bgColor: 'bg-pink-900/50', hex: '#f9a8d4' },
  [HabitCategory.LEISURE]: { color: 'text-indigo-300', bgColor: 'bg-indigo-900/50', hex: '#a5b4fc' },
};


export const MOTIVATIONAL_QUOTES = [
    "La disciplina es el puente entre las metas y los logros.",
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "No esperes. El momento nunca será el adecuado.",
    "Cree que puedes y ya estás a medio camino.",
    "El futuro pertenece a quienes creen en la belleza de sus sueños."
];
