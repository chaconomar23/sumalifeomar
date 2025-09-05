import React, { useMemo } from 'react';
import Card from '../components/Card';
import { ScheduledHabit, Assignment, SubjectWithGrades } from '../types';
import { HABIT_CATEGORIES, MOTIVATIONAL_QUOTES } from '../constants';

interface DashboardProps {
  schedule: ScheduledHabit[];
  assignments: Assignment[];
  subjects: SubjectWithGrades[];
}

const Dashboard: React.FC<DashboardProps> = ({ schedule, assignments, subjects }) => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const todaysHabits = schedule.sort((a, b) => a.startTime - b.startTime);
    
  const todaysAssignments = assignments.filter(a => {
    const dueDate = a.dueDate;
    return dueDate.getDate() === today.getDate() &&
           dueDate.getMonth() === today.getMonth() &&
           dueDate.getFullYear() === today.getFullYear();
  });
  
  const tomorrowsAssignments = assignments.filter(a => {
    const dueDate = a.dueDate;
    return dueDate.getDate() === tomorrow.getDate() &&
           dueDate.getMonth() === tomorrow.getMonth() &&
           dueDate.getFullYear() === tomorrow.getFullYear();
  });
  
  const getSubjectName = (subjectId: string) => {
      return subjects.find(s => s.id === subjectId)?.name || 'Desconocido';
  }

  const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)], []);
  
  const formatTime = (time: number) => {
      const hour = Math.floor(time);
      const minutes = Math.round((time - hour) * 60);
      return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">SUMA LIFE</h1>
        <p className="text-purple-300 mt-1 italic">"{quote}"</p>
      </header>
      
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-white">Agenda de Hoy</h2>
        <div className="space-y-3">
            {todaysHabits.length > 0 ? todaysHabits.map(habit => {
                const categoryStyle = HABIT_CATEGORIES[habit.category];
                return (
                    <div key={habit.instanceId} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center">
                            <span className="text-sm font-mono text-gray-400 mr-4">{formatTime(habit.startTime)}</span>
                            <div>
                                <p className="font-semibold text-white">{habit.name}</p>
                                <p className={`text-xs ${categoryStyle.color}`}>{habit.category}</p>
                            </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${habit.completed ? 'bg-green-500' : 'border-2 border-gray-500'}`}></div>
                    </div>
                );
            }) : <p className="text-gray-400">No hay hábitos programados para hoy.</p>}
        </div>
      </Card>
      
      <Card>
          <h2 className="text-xl font-semibold mb-4 text-white">Pendientes Académicos</h2>
          <div className="space-y-4">
              <div>
                  <h3 className="font-bold text-purple-400 mb-2">Para Hoy</h3>
                  {todaysAssignments.length > 0 ? todaysAssignments.map(a => (
                      <div key={a.id} className="bg-gray-800 p-3 rounded-lg">
                          <p className="font-semibold">{a.title}</p>
                          <p className="text-sm text-gray-400">{getSubjectName(a.subjectId)}</p>
                      </div>
                  )) : <p className="text-gray-400 text-sm">¡Ningún pendiente para hoy!</p>}
              </div>
              <div>
                  <h3 className="font-bold text-blue-400 mb-2">Para Mañana</h3>
                  {tomorrowsAssignments.length > 0 ? tomorrowsAssignments.map(a => (
                       <div key={a.id} className="bg-gray-800 p-3 rounded-lg">
                          <p className="font-semibold">{a.title}</p>
                          <p className="text-sm text-gray-400">{getSubjectName(a.subjectId)}</p>
                      </div>
                  )) : <p className="text-gray-400 text-sm">Sin pendientes para mañana.</p>}
              </div>
          </div>
      </Card>
    </div>
  );
};

export default Dashboard;
