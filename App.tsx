import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Habit, ScheduledHabit, SubjectWithGrades, Assignment, Grade, HabitType, Subject } from './types';
import { NAV_ITEMS } from './constants';
import Dashboard from './screens/Dashboard';
import Routines from './screens/Routines';
import Academics from './screens/Academics';
import Statistics from './screens/Statistics';
import Settings from './screens/Settings';
import SubjectDetail from './screens/SubjectDetail';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [schedule, setSchedule] = useState<ScheduledHabit[]>([]);
  const [subjects, setSubjects] = useState<SubjectWithGrades[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [dailyProgress, setDailyProgress] = useState<{ [habitId: string]: { completed?: boolean; count?: number } }>({});

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    const habitWithId = { ...newHabit, id: `h_${Date.now()}` };
    setHabits(prev => [...prev, habitWithId]);

    if (habitWithId.type === HabitType.CHECK_IN || habitWithId.type === HabitType.COUNTER) {
        setDailyProgress(prev => ({
            ...prev,
            [habitWithId.id]: {
                completed: false,
                count: 0
            }
        }));
    }
  };
  
  const handleAddSubject = (newSubject: Omit<SubjectWithGrades, 'id' | 'grades'>) => {
      const subjectWithId = { ...newSubject, id: `s_${Date.now()}`, grades: [] };
      setSubjects(prev => [...prev, subjectWithId]);
  };

  const handleUpdateSubject = (subjectId: string, updatedData: Partial<Omit<Subject, 'id'>>) => {
      setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updatedData } : s));
  };
  
  const handleDeleteSubject = (subjectId: string) => {
      if (window.confirm('¿Estás seguro de que quieres eliminar esta materia? Todas sus tareas y calificaciones asociadas también se borrarán.')) {
        // First, delete assignments linked to this subject
        setAssignments(prev => prev.filter(a => a.subjectId !== subjectId));
        // Then, delete the subject itself
        setSubjects(prev => prev.filter(s => s.id !== subjectId));
      }
  };
  
  const handleAddAssignment = (newAssignment: Omit<Assignment, 'id' | 'completed'>) => {
      const assignmentWithId = { ...newAssignment, id: `a_${Date.now()}`, completed: false };
      setAssignments(prev => [...prev, assignmentWithId].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
  };

  const handleUpdateAssignment = (assignmentId: string, updatedData: Partial<Omit<Assignment, 'id'>>) => {
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, ...updatedData } : a));
  };
  
  const handleToggleAssignmentCompletion = (assignmentId: string) => {
      setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, completed: !a.completed } : a));
  };

  const handleDeleteAssignment = (assignmentId: string) => {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };
  
  const handleAddGrade = (subjectId: string, newGrade: Omit<Grade, 'id'>) => {
      const gradeWithId = { ...newGrade, id: `g_${Date.now()}` };
      setSubjects(prev => prev.map(s => {
          if (s.id === subjectId) {
              const updatedGrades = [...s.grades, gradeWithId].sort((a, b) => a.date.getTime() - b.date.getTime());
              return { ...s, grades: updatedGrades };
          }
          return s;
      }));
  };

  const handleUpdateGrade = (subjectId: string, gradeId: string, updatedGrade: Partial<Omit<Grade, 'id'>>) => {
      setSubjects(prev => prev.map(s => {
          if (s.id === subjectId) {
              const updatedGrades = s.grades.map(g => g.id === gradeId ? { ...g, ...updatedGrade } : g);
              return { ...s, grades: updatedGrades };
          }
          return s;
      }));
  };

  const handleDeleteGrade = (subjectId: string, gradeId: string) => {
      setSubjects(prev => prev.map(s => {
          if (s.id === subjectId) {
              return { ...s, grades: s.grades.filter(g => g.id !== gradeId) };
          }
          return s;
      }));
  };


  const handleScheduleHabit = (habitId: string, startTime: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit && habit.type === HabitType.TIMED && habit.duration) {
      setSchedule(prev => {
        const newHabitEndTime = startTime + habit.duration! / 60;
        const filtered = prev.filter(scheduledHabit => {
            const existingHabitEndTime = scheduledHabit.startTime + scheduledHabit.duration / 60;
            const overlap = (startTime < existingHabitEndTime) && (newHabitEndTime > scheduledHabit.startTime);
            return !overlap;
        });

        return [
            ...filtered,
            { ...habit, startTime, completed: false, instanceId: `sh_${Date.now()}` }
        ];
      });
    }
  };

  const handleUpdateScheduledHabit = (instanceId: string, newStartTime: number) => {
    setSchedule(prev => {
        const habitToUpdate = prev.find(h => h.instanceId === instanceId);
        if (!habitToUpdate) return prev;

        const newHabitEndTime = newStartTime + habitToUpdate.duration / 60;
        
        const filtered = prev.filter(h => {
            if (h.instanceId === instanceId) return false;
            const existingHabitEndTime = h.startTime + h.duration / 60;
            const overlap = (newStartTime < existingHabitEndTime) && (newHabitEndTime > h.startTime);
            return !overlap;
        });

        return [...filtered, { ...habitToUpdate, startTime: newStartTime }];
    });
  };

  const handleRemoveScheduledHabit = (instanceId: string) => {
      setSchedule(prev => prev.filter(h => h.instanceId !== instanceId));
  };
  
  const toggleHabitCompletion = (instanceId: string) => {
    setSchedule(prev => prev.map(habit => 
        habit.instanceId === instanceId ? { ...habit, completed: !habit.completed } : habit
    ));
  };

  const handleToggleCheckIn = (habitId: string) => {
    setDailyProgress(prev => ({
        ...prev,
        [habitId]: { ...prev[habitId], completed: !prev[habitId]?.completed }
    }));
  };

  const handleUpdateCounter = (habitId: string, newCount: number) => {
      const habit = habits.find(h => h.id === habitId);
      if (!habit || habit.goal === undefined) return;
      
      setDailyProgress(prev => ({
          ...prev,
          [habitId]: { ...prev[habitId], count: Math.max(0, Math.min(habit.goal!, newCount)) }
      }));
  };


  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col">
      <main className="flex-grow pb-24">
        <Routes>
          <Route path="/" element={<Dashboard schedule={schedule} assignments={assignments} subjects={subjects} />} />
          <Route 
            path="/routines" 
            element={<Routines 
              habits={habits} 
              schedule={schedule} 
              subjects={subjects}
              assignments={assignments}
              dailyProgress={dailyProgress}
              onScheduleHabit={handleScheduleHabit} 
              onToggleCompletion={toggleHabitCompletion} 
              onAddHabit={handleAddHabit} 
              onRemoveScheduledHabit={handleRemoveScheduledHabit} 
              onUpdateScheduledHabit={handleUpdateScheduledHabit}
              onToggleCheckIn={handleToggleCheckIn}
              onUpdateCounter={handleUpdateCounter}
            />} 
          />
          <Route path="/academics" element={<Academics subjects={subjects} assignments={assignments} onAddSubject={handleAddSubject} onUpdateSubject={handleUpdateSubject} onDeleteSubject={handleDeleteSubject} onAddAssignment={handleAddAssignment} onUpdateAssignment={handleUpdateAssignment} onToggleAssignmentCompletion={handleToggleAssignmentCompletion} onDeleteAssignment={handleDeleteAssignment} />} />
          <Route path="/academics/:subjectId" element={<SubjectDetail subjects={subjects} onAddGrade={handleAddGrade} onUpdateGrade={handleUpdateGrade} onDeleteGrade={handleDeleteGrade} />} />
          <Route path="/statistics" element={<Statistics schedule={schedule} subjects={subjects} habits={habits} dailyProgress={dailyProgress} assignments={assignments} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-gray-800">
        <div className="flex justify-around max-w-md mx-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-center px-2 py-3 w-full transition-colors duration-200 ${
                  isActive ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
                }`
              }
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;