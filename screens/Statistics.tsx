import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from 'recharts';
import { ScheduledHabit, SubjectWithGrades, HabitCategory, Habit, HabitType, Assignment } from '../types';
import Card from '../components/Card';
import { HABIT_CATEGORIES } from '../constants';

interface StatisticsProps {
  schedule: ScheduledHabit[];
  subjects: SubjectWithGrades[];
  habits: Habit[];
  assignments: Assignment[];
  dailyProgress: { [habitId: string]: { completed?: boolean; count?: number } };
}

const Statistics: React.FC<StatisticsProps> = ({ schedule, subjects, habits, assignments, dailyProgress }) => {

  const habitTimeData = Object.values(HabitCategory).map(category => {
    const totalMinutes = schedule
      .filter(habit => habit.category === category && habit.completed)
      .reduce((sum, habit) => sum + habit.duration, 0);
    return { name: category, minutos: totalMinutes };
  }).filter(d => d.minutos > 0);

  const calculateAverage = (subject: SubjectWithGrades) => {
    if (subject.grades.length === 0) return null;
    const totalScore = subject.grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0);
    return parseFloat((totalScore / subject.grades.length).toFixed(1));
  };
  
  const academicData = subjects.map(subject => ({ 
      name: subject.name, 
      promedio: calculateAverage(subject)
  })).filter(s => s.promedio !== null);

  const overallAverage = academicData.length > 0 
    ? (academicData.reduce((sum, s) => sum + s.promedio!, 0) / academicData.length).toFixed(1)
    : 'N/A';
    
  const bestSubject = academicData.length > 0 ? academicData.reduce((best, current) => current.promedio! > best.promedio! ? current : best) : null;
  const worstSubject = academicData.length > 0 ? academicData.reduce((worst, current) => current.promedio! < worst.promedio! ? current : worst) : null;

  const assignmentStatusData = [
      { name: 'Completadas', value: assignments.filter(a => a.completed).length },
      { name: 'Pendientes', value: assignments.filter(a => !a.completed).length }
  ].filter(d => d.value > 0);
  const ASSIGNMENT_COLORS = ['#8b5cf6', '#4b5563'];


  const habitConsistency = () => {
      const timedHabitsInSchedule = schedule;
      const trackerHabits = habits.filter(h => h.type === HabitType.CHECK_IN || h.type === HabitType.COUNTER);
      
      const totalHabits = timedHabitsInSchedule.length + trackerHabits.length;
      if (totalHabits === 0) return { completed: 0, total: 0, percentage: 0 };
      
      const completedTimed = timedHabitsInSchedule.filter(h => h.completed).length;
      
      const completedTrackers = trackerHabits.reduce((acc, habit) => {
          const progress = dailyProgress[habit.id];
          if (!progress) return acc;

          if (habit.type === HabitType.CHECK_IN && progress.completed) {
              return acc + 1;
          }
          if (habit.type === HabitType.COUNTER && habit.goal && progress.count && progress.count >= habit.goal) {
              return acc + 1;
          }
          return acc;
      }, 0);

      const completedHabits = completedTimed + completedTrackers;
      
      return {
          completed: completedHabits,
          total: totalHabits,
          percentage: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0
      };
  }

  const consistency = habitConsistency();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
        <p className="text-gray-400 mt-1">Visualiza tu progreso y consistencia.</p>
      </header>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Estadísticas Académicas</h2>
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center bg-gray-800/50 p-4 rounded-lg">
                <p className="text-5xl font-bold text-purple-400">{overallAverage}</p>
                <p className="text-sm text-gray-400 mt-1">Promedio General</p>
            </div>
            <div className="space-y-3">
                {bestSubject && <div className="bg-green-900/50 p-3 rounded-lg text-center">
                    <p className="font-bold text-green-300">{bestSubject.name}</p>
                    <p className="text-xs text-green-400">Mejor Materia ({bestSubject.promedio}%)</p>
                </div>}
                 {worstSubject && <div className="bg-red-900/50 p-3 rounded-lg text-center">
                    <p className="font-bold text-red-300">{worstSubject.name}</p>
                    <p className="text-xs text-red-400">Peor Materia ({worstSubject.promedio}%)</p>
                </div>}
            </div>
            <div className="w-full h-32">
                 <ResponsiveContainer>
                    <PieChart>
                        <Pie data={assignmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5}>
                             {assignmentStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ASSIGNMENT_COLORS[index % ASSIGNMENT_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem'}}/>
                        <Legend iconSize={10}/>
                    </PieChart>
                 </ResponsiveContainer>
            </div>
          </div>
        ) : <p className="flex items-center justify-center h-full text-gray-400">No hay datos académicos para mostrar.</p>}
      </Card>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <h2 className="text-xl font-semibold mb-4">Consistencia de Hábitos (Hoy)</h2>
            <div className="flex items-center justify-center h-48">
                {consistency.total > 0 ? (
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90 18 18)">
                            <path className="text-gray-700" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-purple-500 transition-all duration-500" strokeWidth="3" fill="none" stroke="currentColor" strokeDasharray={`${consistency.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white">{consistency.percentage}%</span>
                            <span className="text-sm text-gray-400">{consistency.completed} de {consistency.total}</span>
                        </div>
                    </div>
                ) : <p className="text-gray-400">No hay hábitos para hoy.</p>}
            </div>
        </Card>
        
        <Card>
            <h2 className="text-xl font-semibold mb-4">Tiempo Invertido por Categoría (Hoy)</h2>
            <div className="w-full h-48">
            {habitTimeData.length > 0 ? (
            <ResponsiveContainer>
                <PieChart>
                <Pie data={habitTimeData} dataKey="minutos" nameKey="name" cx="50%" cy="50%" outerRadius={60}>
                    {habitTimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={HABIT_CATEGORIES[entry.name as HabitCategory].hex} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem'}}/>
                <Legend iconSize={10} />
                </PieChart>
            </ResponsiveContainer>
            ) : <p className="flex items-center justify-center h-full text-gray-400">No hay hábitos agendados completados.</p>}
            </div>
        </Card>
      </div>
      
    </div>
  );
};

export default Statistics;
