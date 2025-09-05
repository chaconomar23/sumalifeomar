import React, { useState, useRef, useMemo } from 'react';
import { Habit, ScheduledHabit, HabitCategory, HabitType, SubjectWithGrades, Assignment } from '../types';
import Card from '../components/Card';
import HabitBlock from '../components/HabitBlock';
import { PlusIcon, HABIT_CATEGORIES } from '../constants';

interface RoutinesProps {
  habits: Habit[];
  schedule: ScheduledHabit[];
  subjects: SubjectWithGrades[];
  assignments: Assignment[];
  dailyProgress: { [habitId: string]: { completed?: boolean; count?: number } };
  onScheduleHabit: (habitId: string, hour: number) => void;
  onToggleCompletion: (instanceId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
  onRemoveScheduledHabit: (instanceId: string) => void;
  onUpdateScheduledHabit: (instanceId: string, newStartTime: number) => void;
  onToggleCheckIn: (habitId: string) => void;
  onUpdateCounter: (habitId: string, newCount: number) => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Routines: React.FC<RoutinesProps> = ({ 
    habits, schedule, subjects, assignments, dailyProgress, onScheduleHabit, onToggleCompletion, onAddHabit, 
    onRemoveScheduledHabit, onUpdateScheduledHabit, onToggleCheckIn, onUpdateCounter 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<HabitType>(HabitType.TIMED);
  const [newHabitDuration, setNewHabitDuration] = useState(30);
  const [newHabitGoal, setNewHabitGoal] = useState(1);
  const [newHabitCategory, setNewHabitCategory] = useState<HabitCategory>(HabitCategory.MIND);
  const [newHabitRules, setNewHabitRules] = useState('');
  const agendaRef = useRef<HTMLDivElement>(null);

  const { checkInHabits, counterHabits } = useMemo(() => {
    return habits.reduce((acc, habit) => {
        if(habit.type === HabitType.CHECK_IN) acc.checkInHabits.push(habit);
        if(habit.type === HabitType.COUNTER) acc.counterHabits.push(habit);
        return acc;
    }, { checkInHabits: [] as Habit[], counterHabits: [] as Habit[] });
  }, [habits]);

  const today = new Date();
  const todayDay = today.getDay();
  
  const todaysAssignments = useMemo(() => assignments.filter(a => {
      const dueDate = a.dueDate;
      return dueDate.getDate() === today.getDate() &&
             dueDate.getMonth() === today.getMonth() &&
             dueDate.getFullYear() === today.getFullYear() &&
             !a.completed;
  }), [assignments, today]);

  const START_HOUR = 6;
  const END_HOUR = 24;
  const HOUR_HEIGHT_PX = 80;
  const SNAP_INTERVAL_MINUTES = 15;
  const SNAP_INTERVAL_HOURS = SNAP_INTERVAL_MINUTES / 60;
  
  const timelineHours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR), []);
  
  const timeToDecimal = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours + minutes / 60;
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!agendaRef.current) return;
    
    const rect = agendaRef.current.getBoundingClientRect();
    const dropY = e.clientY - rect.top;
    
    const rawHour = (dropY / HOUR_HEIGHT_PX) + START_HOUR;
    const snappedHour = Math.round(rawHour / SNAP_INTERVAL_HOURS) * SNAP_INTERVAL_HOURS;
    
    const newHabitId = e.dataTransfer.getData('newHabitId');
    const existingInstanceId = e.dataTransfer.getData('existingInstanceId');
    
    if (newHabitId) {
        onScheduleHabit(newHabitId, snappedHour);
    } else if (existingInstanceId) {
        onUpdateScheduledHabit(existingInstanceId, snappedHour);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const resetForm = () => {
    setNewHabitName('');
    setNewHabitType(HabitType.TIMED);
    setNewHabitDuration(30);
    setNewHabitGoal(1);
    setNewHabitCategory(HabitCategory.MIND);
    setNewHabitRules('');
    setIsModalOpen(false);
  }

  const handleHabitSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newHabitName.trim()) return;

      const baseHabit = {
          name: newHabitName,
          category: newHabitCategory,
          rules: newHabitRules,
      };

      let habitToAdd;
      if (newHabitType === HabitType.TIMED) {
          habitToAdd = { ...baseHabit, type: HabitType.TIMED, duration: newHabitDuration };
      } else if (newHabitType === HabitType.COUNTER) {
          habitToAdd = { ...baseHabit, type: HabitType.COUNTER, goal: newHabitGoal };
      } else {
          habitToAdd = { ...baseHabit, type: HabitType.CHECK_IN };
      }
      
      onAddHabit(habitToAdd);
      resetForm();
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nuevo Hábito">
          <form onSubmit={handleHabitSubmit} className="space-y-4">
              <input type="text" placeholder="Nombre" value={newHabitName} onChange={e => setNewHabitName(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
              
              <div>
                  <label className="text-sm text-gray-400 mb-2 block">Tipo de Hábito</label>
                  <div className="grid grid-cols-3 gap-2">
                      {(Object.values(HabitType)).map(type => (
                          <button key={type} type="button" onClick={() => setNewHabitType(type)} className={`py-2 px-1 text-sm rounded-lg border transition-colors ${newHabitType === type ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                              {type}
                          </button>
                      ))}
                  </div>
              </div>

              {newHabitType === HabitType.TIMED && <input type="number" placeholder="Duración (minutos)" value={newHabitDuration} onChange={e => setNewHabitDuration(Math.max(1, parseInt(e.target.value)))} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />}
              {newHabitType === HabitType.COUNTER && <input type="number" placeholder="Objetivo (repeticiones)" value={newHabitGoal} onChange={e => setNewHabitGoal(Math.max(1, parseInt(e.target.value)))} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />}

              <select value={newHabitCategory} onChange={e => setNewHabitCategory(e.target.value as HabitCategory)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2">
                  {Object.values(HabitCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <textarea placeholder="Reglas (Opcional)" value={newHabitRules} onChange={e => setNewHabitRules(e.target.value)} rows={2} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2"></textarea>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Guardar Hábito</button>
          </form>
      </Modal>

      <header>
        <h1 className="text-3xl font-bold text-white">Rutinas y Hábitos</h1>
        <p className="text-gray-400 mt-1">Crea bloques de hábito y arrástralos a la agenda para planificar tu día.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Bloques de Hábito</h2>
                <button onClick={() => setIsModalOpen(true)} className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/40"><PlusIcon className="w-5 h-5" /></button>
            </div>
            {habits.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3">
                    {habits.map(habit => <HabitBlock key={habit.id} habit={habit} />)}
                </div>
            ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                    <p className="text-gray-400">No has creado hábitos.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-2 text-purple-400 font-semibold">Crea tu primer hábito</button>
                </div>
            )}
          </Card>
          {(checkInHabits.length > 0 || counterHabits.length > 0) && (
             <Card>
                <h2 className="text-xl font-semibold mb-4">Trackers Diarios</h2>
                <div className="space-y-3">
                    {checkInHabits.map(habit => {
                        const progress = dailyProgress[habit.id];
                        const categoryStyle = HABIT_CATEGORIES[habit.category];
                        return (
                            <div key={habit.id} className="flex items-center justify-between bg-gray-800/70 p-3 rounded-lg">
                                <div>
                                    <p className="font-semibold text-white">{habit.name}</p>
                                    <p className={`text-xs ${categoryStyle.color}`}>{habit.category}</p>
                                </div>
                                <button onClick={() => onToggleCheckIn(habit.id)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${progress?.completed ? 'bg-green-500' : 'bg-gray-700'}`}>
                                    {progress?.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </button>
                            </div>
                        )
                    })}
                    {counterHabits.map(habit => {
                        const progress = dailyProgress[habit.id];
                        const categoryStyle = HABIT_CATEGORIES[habit.category];
                        const isComplete = progress?.count !== undefined && habit.goal !== undefined && progress.count >= habit.goal;
                        return (
                             <div key={habit.id} className="bg-gray-800/70 p-3 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-white">{habit.name}</p>
                                        <p className={`text-xs ${categoryStyle.color}`}>{habit.category}</p>
                                    </div>
                                    <p className={`font-mono text-lg font-bold ${isComplete ? 'text-green-400' : 'text-white'}`}>{progress?.count || 0} / {habit.goal}</p>
                                </div>
                                <div className="flex items-center justify-end space-x-2 mt-2">
                                    <button onClick={() => onUpdateCounter(habit.id, (progress?.count || 0) - 1)} className="w-8 h-8 rounded-full bg-gray-700 text-lg text-white">-</button>
                                    <button onClick={() => onUpdateCounter(habit.id, (progress?.count || 0) + 1)} className="w-8 h-8 rounded-full bg-gray-700 text-lg text-white">+</button>
                                </div>
                            </div>
                        )
                    })}
                </div>
             </Card>
          )}
        </div>
        
        <div className="lg:col-span-2">
            <Card>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Agenda del Día</h2>
                    {todaysAssignments.length > 0 && (
                        <div className="mt-2 bg-yellow-900/50 border border-yellow-700 p-3 rounded-lg">
                            <h3 className="font-bold text-yellow-300">Tareas para hoy:</h3>
                            <ul className="list-disc list-inside text-yellow-200 text-sm mt-1">
                                {todaysAssignments.map(a => <li key={a.id}>{a.title}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
                <div ref={agendaRef} onDrop={handleDrop} onDragOver={handleDragOver} className="relative bg-gray-900 rounded-lg border border-gray-800 select-none" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT_PX}px` }}>
                    {/* Timeline */}
                    {timelineHours.map(hour => (
                        <div key={hour} className="absolute w-full flex" style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT_PX}px`}}>
                            <span className="w-16 text-center -mt-3 text-xs text-gray-400 font-mono">{String(hour).padStart(2, '0')}:00</span>
                            <div className="flex-1 border-t border-gray-800"></div>
                        </div>
                    ))}

                    {/* Classes */}
                    {subjects.flatMap(subject => subject.schedule
                        .filter(s => s.day === todayDay)
                        .map(s => {
                            const startTime = timeToDecimal(s.startTime);
                            const endTime = timeToDecimal(s.endTime);
                            const top = (startTime - START_HOUR) * HOUR_HEIGHT_PX;
                            const height = (endTime - startTime) * HOUR_HEIGHT_PX;
                            return (
                                <div key={s.id} className="absolute left-16 right-2 p-1" style={{ top: `${top}px`, height: `${height}px` }}>
                                    <div className={`w-full h-full rounded-lg flex p-2 text-left bg-gray-800/80 border-l-4 ${subject.color}`}>
                                        <h4 className="font-semibold text-white text-sm truncate">{subject.name}</h4>
                                    </div>
                                </div>
                            )
                        })
                    )}

                    {/* Scheduled Habits */}
                    {schedule.map(habit => {
                        const top = (habit.startTime - START_HOUR) * HOUR_HEIGHT_PX;
                        const height = (habit.duration / 60) * HOUR_HEIGHT_PX;
                        const categoryStyle = HABIT_CATEGORIES[habit.category];
                        return (
                            <div key={habit.instanceId} draggable onDragStart={(e) => e.dataTransfer.setData('existingInstanceId', habit.instanceId)} className="absolute left-16 right-2 p-1 group cursor-grab active:cursor-grabbing z-10" style={{ top: `${top}px`, height: `${height}px`, minHeight: '20px' }}>
                                <div className={`relative w-full h-full rounded-lg flex p-2 text-left transition-all duration-200 ${categoryStyle.bgColor} ${habit.completed ? 'opacity-50' : ''}`}>
                                    <div className="flex-grow overflow-hidden">
                                        <h4 className="font-semibold text-white text-sm truncate">{habit.name}</h4>
                                        <p className="text-xs text-gray-400">{habit.duration} min</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
                                        <button onClick={() => onToggleCompletion(habit.instanceId)} className="p-1">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${habit.completed ? 'bg-green-500' : 'bg-gray-700/50 border border-gray-500'}`}>
                                                {habit.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                        </button>
                                        <button onClick={() => onRemoveScheduledHabit(habit.instanceId)} className="p-1 text-gray-400 hover:text-red-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Routines;
