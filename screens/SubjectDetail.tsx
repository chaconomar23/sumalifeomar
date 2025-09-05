import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SubjectWithGrades, Grade } from '../types';
import Card from '../components/Card';
import { PlusIcon } from '../constants';

interface SubjectDetailProps {
    subjects: SubjectWithGrades[];
    onAddGrade: (subjectId: string, grade: Omit<Grade, 'id'>) => void;
    onUpdateGrade: (subjectId: string, gradeId: string, updatedGrade: Partial<Omit<Grade, 'id'>>) => void;
    onDeleteGrade: (subjectId: string, gradeId: string) => void;
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

const PencilIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>;
const TrashIcon = (props: { className?: string }) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;


const SubjectDetail: React.FC<SubjectDetailProps> = ({ subjects, onAddGrade, onUpdateGrade, onDeleteGrade }) => {
    const { subjectId } = useParams<{ subjectId: string }>();
    const subject = useMemo(() => subjects.find(s => s.id === subjectId), [subjects, subjectId]);

    const [isGradeModalOpen, setGradeModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

    // Form states
    const [gradeTitle, setGradeTitle] = useState('');
    const [gradeScore, setGradeScore] = useState<number | ''>('');
    const [gradeMaxScore, setGradeMaxScore] = useState<number | ''>(100);
    const [gradeDate, setGradeDate] = useState('');

    const resetGradeForm = () => {
        setGradeTitle('');
        setGradeScore('');
        setGradeMaxScore(100);
        setGradeDate('');
        setEditingGrade(null);
    };

    const handleGradeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!subject || gradeScore === '' || gradeMaxScore === '' || !gradeDate) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const gradeData = { 
            assignmentTitle: gradeTitle, 
            score: gradeScore, 
            maxScore: gradeMaxScore,
            date: new Date(gradeDate + 'T00:00:00-05:00') // Adjust timezone as needed
        };

        if (editingGrade) {
            onUpdateGrade(subject.id, editingGrade.id, gradeData);
        } else {
            onAddGrade(subject.id, gradeData);
        }
        
        resetGradeForm();
        setGradeModalOpen(false);
    };
    
    const openEditGradeModal = (grade: Grade) => {
        setEditingGrade(grade);
        setGradeTitle(grade.assignmentTitle);
        setGradeScore(grade.score);
        setGradeMaxScore(grade.maxScore);
        setGradeDate(grade.date.toISOString().split('T')[0]);
        setGradeModalOpen(true);
    };

    const openNewGradeModal = () => {
        resetGradeForm();
        setGradeDate(new Date().toISOString().split('T')[0]); // Default to today
        setGradeModalOpen(true);
    };

    const calculateAverage = (grades: Grade[]) => {
        if (grades.length === 0) return 'N/A';
        const totalScore = grades.reduce((sum, grade) => sum + (grade.score / grade.maxScore) * 100, 0);
        return (totalScore / grades.length).toFixed(1) + '%';
    };

    const chartData = useMemo(() => {
        return subject?.grades
            .map(g => ({
                name: g.assignmentTitle,
                porcentaje: parseFloat(((g.score / g.maxScore) * 100).toFixed(1)),
                date: g.date,
            }))
            .sort((a,b) => a.date.getTime() - b.date.getTime());
    }, [subject]);

    if (!subject) {
        return <div className="p-6 text-center text-red-400">Materia no encontrada. <Link to="/academics" className="text-purple-400">Volver</Link></div>;
    }

    return (
        <div className="p-4 md:p-6 space-y-6">
            <Modal isOpen={isGradeModalOpen} onClose={() => { setGradeModalOpen(false); resetGradeForm(); }} title={editingGrade ? "Editar Calificación" : "Agregar Calificación"}>
                <form onSubmit={handleGradeSubmit} className="space-y-4">
                <input type="text" placeholder="Título (Ej: Parcial 1)" value={gradeTitle} onChange={e => setGradeTitle(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
                <div className="flex gap-4">
                    <input type="number" placeholder="Nota" value={gradeScore} onChange={e => setGradeScore(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
                    <input type="number" placeholder="Máx." value={gradeMaxScore} onChange={e => setGradeMaxScore(e.target.value === '' ? '' : parseFloat(e.target.value))} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
                </div>
                <input type="date" value={gradeDate} onChange={e => setGradeDate(e.target.value)} className="w-full bg-gray-800 text-white rounded-lg border border-gray-700 px-3 py-2" required />
                <button type="submit" className="w-full bg-purple-600 text-white font-bold py-2 rounded-lg">Guardar Calificación</button>
                </form>
            </Modal>

            <header>
                <Link to="/academics" className="text-sm text-purple-400 hover:underline mb-2 block">&larr; Volver a Académico</Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{subject.name}</h1>
                        <p className={`text-lg font-semibold ${subject.color.replace('border-', 'text-')}`}>{calculateAverage(subject.grades)} de promedio</p>
                    </div>
                </div>
            </header>

            <Card>
                <h2 className="text-xl font-semibold mb-4">Rendimiento</h2>
                <div className="w-full h-64">
                {chartData && chartData.length > 1 ? (
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%"/>
                            <Tooltip cursor={{fill: 'rgba(168, 85, 247, 0.1)'}} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.75rem'}} />
                            <Line type="monotone" dataKey="porcentaje" stroke="#a855f7" strokeWidth={2} dot={{ r: 4, fill: '#a855f7' }} activeDot={{ r: 6 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="flex items-center justify-center h-full text-gray-400">Agrega al menos dos calificaciones para ver el gráfico.</p>}
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Calificaciones</h2>
                    <button onClick={openNewGradeModal} className="p-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/40"><PlusIcon className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                    {subject.grades.length > 0 ? subject.grades.map(grade => (
                        <div key={grade.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg group">
                            <div>
                                <p className="font-semibold text-white">{grade.assignmentTitle}</p>
                                <p className="text-sm text-gray-400">{grade.date.toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <p className="font-bold text-lg text-purple-400">{grade.score} / {grade.maxScore}</p>
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditGradeModal(grade)} className="p-1 text-gray-400 hover:text-blue-400"><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={() => onDeleteGrade(subject.id, grade.id)} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-gray-400 text-center py-4">No has agregado ninguna calificación.</p>}
                </div>
            </Card>
        </div>
    )
}

export default SubjectDetail;
