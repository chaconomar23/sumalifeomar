
import React from 'react';
import Card from '../components/Card';

const Settings: React.FC = () => {
    const SettingRow: React.FC<{ title: string, description: string, children?: React.ReactNode }> = ({ title, description, children }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-800">
            <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            {children}
        </div>
    );

    return (
        <div className="p-4 md:p-6 space-y-6">
            <header>
                <h1 className="text-3xl font-bold text-white">Configuración</h1>
                <p className="text-gray-400 mt-1">Personaliza tu experiencia en SUMA LIFE.</p>
            </header>

            <Card>
                <h2 className="text-xl font-semibold mb-2">Perfil</h2>
                <SettingRow title="Nombre de Usuario" description="Estudiante Pro">
                    <button className="text-sm text-purple-400 font-semibold">Editar</button>
                </SettingRow>
                <SettingRow title="Correo Electrónico" description="usuario@example.com">
                    <button className="text-sm text-purple-400 font-semibold">Editar</button>
                </SettingRow>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold mb-2">Personalización</h2>
                <SettingRow title="Color de Acento" description="Elige tu color preferido para la app.">
                    <div className="flex space-x-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white"></div>
                        <div className="w-6 h-6 rounded-full bg-blue-500"></div>
                        <div className="w-6 h-6 rounded-full bg-green-500"></div>
                        <div className="w-6 h-6 rounded-full bg-pink-500"></div>
                    </div>
                </SettingRow>
                 <SettingRow title="Notificaciones" description="Recibe recordatorios de tus hábitos y tareas.">
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" defaultChecked/>
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </SettingRow>
            </Card>
            
            <Card>
                 <h2 className="text-xl font-semibold mb-2">General</h2>
                 <SettingRow title="Idioma" description="Español">
                     <button className="text-sm text-purple-400 font-semibold">Cambiar</button>
                 </SettingRow>
                 <SettingRow title="Zona Horaria" description="GMT-5">
                    <button className="text-sm text-purple-400 font-semibold">Cambiar</button>
                 </SettingRow>
            </Card>
        </div>
    );
};

export default Settings;
