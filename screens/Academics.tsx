import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SubjectWithGrades, Assignment, SubjectSchedule, Subject } from '../types';
import Card from '../components/Card';
import { PlusIcon } from '../constants';

interface AcademicsProps {
  subjects: SubjectWithGrades[];
  assignments: Assignment[];
  onAddSubject: (subject: Omit<SubjectWithGrades, 'id' | 'grades'>) => void;
  onUpdateSubject: (subjectId: string, updatedData: Partial<Omit<Subject, 'id'>>) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'completed'>) => void;
  onUpdateAssignment: (assignmentId: string, updatedData: Partial<Omit<Assignment, 'id'>>) => void;
  onToggleAssignmentCompletion: (assignmentId: string) => void;
  onDeleteAssignment: (assignmentId: string) => void;
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

const calculateAverage = (subject: SubjectWithGrades) => {
  if (subject.grades.length === 0) return 'N/A';
  const totalScore = subject.grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0);
  return (totalScore / subject.grades.length).toFixed(1);
};

const PencilIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const TrashIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;


const AcademicCalendar: React.FC<{ 
    assignments: Assignment[]; 
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
}> = ({ assignments, selectedDate, onDateSelect }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const assignmentsByDate = useMemo(() => {
        return assignments.reduce((acc, assignment) => {
            const dateStr = assignment.dueDate.toISOString().split('T')[0];
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(assignment);
            return acc;
        }, {} as { [key: string]: Assignment[] });
    }, [assignments]);
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

    const days = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    }

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
        onDateSelect(null as any); // Reset selection on month change
    }
    
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <div>
                    <button onClick={() => changeMonth(-1)} className="p-1 text-gray-400 hover:text-white">&lt;</button>
                    <button onClick={() => changeMonth(1)} className="p-1 text-gray-400 hover:text-white">&gt;</button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <div key={i}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map(d => {
                    const dateStr = d.toISOString().split('T')[0];
                    const hasAssignment = assignmentsByDate[dateStr];
                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                    return (
                        <div 
                            key={d.toISOString()} 
                            onClick={() => onDateSelect(d)}
                            className={`relative h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${d.getMonth() !== currentDate.getMonth() ? 'text-gray-600' : 'text-gray-200'} ${isToday(d) && !isSelected ? 'bg-purple-600/30' : ''} ${isSelected ? 'bg-purple-500 text-white font-bold' : 'hover:bg-gray-800'}`}>
                            {d.getDate()}
                            {hasAssignment && <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-yellow-400'}`}></div>}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

const AssignmentList: React.FC<{ 
    assignments: Assignment[]; 
    subjects: SubjectWithGrades[];
    onToggle: (id: string) => void;
    onEdit: (assignment: Assignment) => void;
    onDelete: (id: string) => void;
    emptyText: string;
}> = ({ assignments, subjects, onToggle, onEdit, onDelete, emptyText }) => {
    return (
         <div className="space-y-3">
            {assignments.length > 0 ? assignments.map(assignment => {
                const subject = subjects.find(s => s.id === assignment.subjectId);
                return (
                <div key={assignment.id} className={`flex items-center justify-between bg-gray-800 p-3 rounded-lg group ${assignment.completed ? 'opacity-50' : ''}`}>
                    <div className="flex items-center">
                        <button onClick={() => onToggle(assignment.id)} className={`w-5 h-5 rounded-md mr-4 flex-shrink-0 border-2 ${assignment.completed ? 'bg-purple-500 border-purple-500' : 'border-gray-500'}`}>
                            {assignment.completed && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <div>
                            <p className={`font-semibold text-white ${assignment.completed ? 'line-through' : ''}`}>{assignment.title}</p>
                            <p className={`text-sm ${subject?.color.replace('border-', 'text-')}`}>{subject?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                         <p className="text-sm text-gray-400 hidden sm:block">{assignment.dueDate.toLocaleDateString()}</p>
                         <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(assignment)} className="p-1 text-gray-400 hover:text-blue-400"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => onDelete(assignment.id)} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                         </div>
                    </div>
                </div>
                );
            }) : <p className="text-gray-400 text-center py-4">{emptyText}</p>}
        </div>
    );
}


const Academics: React.FC<AcademicsProps> = ({ subjects, assignments, onAddSubject, onUpdateSubject, onDeleteSubject, onAddAssignment, onUpdateAssignment, onToggleAssignmentCompletion, onDeleteAssignment }) => {
  const [isSubjectModalOpen, setSubjectModalOpen] = useState(false);
  const [isAssignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editingSubject, setEditingSubject] = useState<SubjectWithGrades | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form states
  const [subjectName, setSubjectName] = useState('');
  const [subjectColor, setSubjectColor] = useState('border-blue-500');
  // Fix: Changed schedule state type to allow for optional 'id' property.
  // This resolves an issue where newly added schedule items (without an id) would cause a type error
  // when trying to generate a final schedule with guaranteed IDs for all items.
  const [schedule, setSchedule] = useState<Partial<SubjectSchedule>[]>([]);

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentSubject, setAssignmentSubject] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');

  const resetSubjectForm = () => { setSubjectName(''); setSubjectColor('border-blue-500'); setSchedule([]); setEditingSubject(null); };
  const resetAssignmentForm = () => { setAssignmentTitle(''); setAssignmentSubject(''); setAssignmentDueDate(''); setEditingAssignment(null); };
  
  const handleSubjectSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const finalSchedule = schedule
          .filter(s => s.startTime && s.endTime)
          .map(s => ({...s, id: s.id || `sch_${Date.now()}_${Math.random()}`}));

      const subjectData = { name: subjectName, color: subjectColor, schedule: finalSchedule as SubjectSchedule[] };

      if (editingSubject) {
          onUpdateSubject(editingSubject.id, subjectData);
      } else {
        onAddSubject(subjectData);
      }
      resetSubjectForm();
      setSubjectModalOpen(false);
  };
  
  const handleAssignmentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!assignmentSubject || !assignmentDueDate) {
          alert("Por favor, completa todos los campos.");
          return;
      }
      const dueDate = new Date(assignmentDueDate + 'T00:00:00-05:00'); // Adjust timezone as needed
      if(editingAssignment) {
          onUpdateAssignment(editingAssignment.id, { title: assignmentTitle, subjectId: assignmentSubject, dueDate });
      } else {
        onAddAssignment({ title: assignmentTitle, subjectId: assignmentSubject, dueDate });
      }
      resetAssignmentForm();
      setAssignmentModalOpen(false);
  };

  const openEditSubjectModal = (subject: SubjectWithGrades) => {
      setEditingSubject(subject);
      setSubjectName(subject.name);
      setSubjectColor(subject.color);
      setSchedule(subject.schedule);
      setSubjectModalOpen(true);
  };

  const openEditAssignmentModal = (assignment: Assignment) => {
      setEditingAssignment(assignment);
      setAssignmentTitle(assignment.title);
      setAssignmentSubject(assignment.subjectId);
      setAssignmentDueDate(assignment.dueDate.toISOString().split('T')[0]);
      setAssignmentModalOpen(true);
  }

  const openNewAssignmentModal = () => {
      resetAssignmentForm();
      setAssignmentModalOpen(true);
  }
  
  const handleScheduleChange = (index: number, field: keyof Omit<SubjectSchedule, 'id'>, value: string | number) => {
    const newSchedule = [...schedule];
    (newSchedule[index] as any)[field] = value;
    setSchedule(newSchedule);
  };

  const addScheduleRow = () => setSchedule([...schedule, { day: 1, startTime: '', endTime: ''}]);
  const removeScheduleRow = (index: number) => setSchedule(schedule.filter((_, i) => i !== index));

  const assignmentsForSelectedDay = useMemo(() => {
      if (!selectedDate) return [];
      return assignments.filter(a => a.dueDate.toDateString() === selectedDate.toDateString());
  }, [selectedDate, assignments]);

  return (
    <div className="p-4 md:p-6 space-y-6">
       {/* Modals */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => { setSubjectModalOpen(false); resetSubjectForm(); }} title={editingSubject ? "Editar Materia" : "Agregar Materia"}>
        <form onSubmit={handleSubjectSubmit} className="space-y-4">
          <input type="text" placeholder="Nombre de la materia" value={subjectName} onChange={e => setSubjectName(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
          <select value={subjectColor} onChange={e => setSubjectColor(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2">
            <option value="border-blue-500">Azul</option> <option value="border-purple-500">Morado</option> <option value="border-green-500">Verde</option> <option value="border-red-500">Rojo</option> <option value="border-yellow-500">Amarillo</option>
          </select>
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Horario de Clases (Opcional)</h3>
            {schedule.map((s, i) => (
                <div key={s.id || i} className="flex gap-2 items-center mb-2">
                    <select value={s.day} onChange={e => handleScheduleChange(i, 'day', parseInt(e.target.value))} className="w-full bg-gray-700 text-white text-sm rounded-md border border-gray-600 px-2 py-1">
                        <option value={1}>Lun</option><option value={2}>Mar</option><option value={3}>Mié</option><option value={4}>Jue</option><option value={5}>Vie</option><option value={6}>Sáb</option><option value={0}>Dom</option>
                    </select>
                    <input type="time" value={s.startTime} onChange={e => handleScheduleChange(i, 'startTime', e.target.value)} className="w-full bg-gray-700 text-white text-sm rounded-md border border-gray-600 px-2 py-1" required />
                    <input type="time" value={s.endTime} onChange={e => handleScheduleChange(i, 'endTime', e.target.value)} className="w-full bg-gray-700 text-white text-sm rounded-md border border-gray-600 px-2 py-1" required />
                    <button type="button" onClick={() => removeScheduleRow(i)} className="text-red-400 p-1">&times;</button>
                </div>
            ))}
             <button type="button" onClick={addScheduleRow} className="text-xs text-purple-400 font-semibold mt-1">+ Agregar horario</button>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg">Guardar Materia</button>
        </form>
      </Modal>
      <Modal isOpen={isAssignmentModalOpen} onClose={() => { setAssignmentModalOpen(false); resetAssignmentForm();}} title={editingAssignment ? "Editar Tarea" : "Agregar Tarea"}>
        <form onSubmit={handleAssignmentSubmit} className="space-y-4">
          <input type="text" placeholder="Título de la tarea" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
          <select value={assignmentSubject} onChange={e => setAssignmentSubject(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required>
            <option value="">Selecciona una materia</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input type="date" value={assignmentDueDate} onChange={e => setAssignmentDueDate(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
          <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg" disabled={subjects.length === 0}>Guardar Tarea</button>
        </form>
      </Modal>

      <header>
        <h1 className="text-3xl font-bold text-white">Gestión Académica</h1>
        <p className="text-gray-400 mt-1">Organiza tus materias, tareas y calificaciones.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Mis Materias</h2>
                <button onClick={() => { resetSubjectForm(); setSubjectModalOpen(true); }} className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/40"><PlusIcon className="w-5 h-5" /></button>
                </div>
                {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjects.map(subject => (
                     <div key={subject.id} className="relative group">
                        <Link to={`/academics/${subject.id}`} className={`block bg-gray-800 p-4 rounded-xl border-l-4 ${subject.color} hover:bg-gray-700/80 transition-colors`}>
                            <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-white">{subject.name}</h3>
                                <p className="text-sm text-gray-400">{subject.grades.length} calificaciones</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-400">{calculateAverage(subject)}</p>
                                <p className="text-xs text-gray-500">Promedio</p>
                            </div>
                            </div>
                        </Link>
                        <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={(e) => { e.stopPropagation(); openEditSubjectModal(subject); }} className="p-2 bg-gray-900/50 rounded-full text-gray-300 hover:text-blue-400"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteSubject(subject.id); }} className="p-2 bg-gray-900/50 rounded-full text-gray-300 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                     </div>
                    ))}
                </div>
                ) : <p className="text-gray-400 text-center py-4">Aún no has agregado ninguna materia.</p>}
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Próximas Tareas</h2>
                <button onClick={openNewAssignmentModal} disabled={subjects.length === 0} className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed"><PlusIcon className="w-5 h-5" /></button>
                </div>
                <AssignmentList 
                    assignments={assignments}
                    subjects={subjects}
                    onToggle={onToggleAssignmentCompletion}
                    onEdit={openEditAssignmentModal}
                    onDelete={onDeleteAssignment}
                    emptyText={`No tienes tareas pendientes. ${subjects.length > 0 ? "" : "(Agrega una materia primero)"}`}
                />
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
             <AcademicCalendar assignments={assignments} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
             {selectedDate && (
                 <Card>
                    <h2 className="text-xl font-semibold mb-4">
                        Pendientes para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                    </h2>
                    <AssignmentList 
                        assignments={assignmentsForSelectedDay}
                        subjects={subjects}
                        onToggle={onToggleAssignmentCompletion}
                        onEdit={openEditAssignmentModal}
                        onDelete={onDeleteAssignment}
                        emptyText="¡Día libre! No hay pendientes."
                    />
                 </Card>
             )}
        </div>
      </div>
    </div>
  );
};

export default Academics;
