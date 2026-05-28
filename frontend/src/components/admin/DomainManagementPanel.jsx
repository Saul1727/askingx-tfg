import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { getDomains, createDomain, deleteDomain } from '../../services/askService';

/**
 * DomainManagementPanel Component
 * 
 * @description
 * This component provides an interface for administrators to manage thematic domains.
 * It allows for viewing, creating, and deleting domains.
 */
const DomainManagementPanel = () => {
    // State for storing the list of domains
    const [domains, setDomains] = useState([]);
    // State to handle loading status during data fetching
    const [isLoading, setIsLoading] = useState(true);
    // State to store any potential errors during API calls
    const [error, setError] = useState(null);
    // State to manage the input for creating a new domain
    const [newDomain, setNewDomain] = useState({ name: '', description: '' });

    /**
     * Fetches all domains from the server.
     * Wrapped in useCallback for optimization.
     */
    const fetchDomains = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const domainsData = await getDomains();
            setDomains(domainsData);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar los dominios.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch domains on component mount
    useEffect(() => {
        fetchDomains();
    }, [fetchDomains]);

    /**
     * Handles the form submission for creating a new domain.
     * @param {React.FormEvent} e - The form event.
     */
    const handleCreateDomain = async (e) => {
        e.preventDefault();
        if (!newDomain.name.trim()) {
            alert('El nombre del dominio no puede estar vacío.');
            return;
        }
        try {
            await createDomain({ 
                name: newDomain.name.trim(),
                description: newDomain.description.trim() 
            });
            setNewDomain({ name: '', description: '' }); // Reset input fields
            fetchDomains(); // Refresh the list of domains
        } catch (err) {
            alert(`Error al crear el dominio: ${err.message}`);
        }
    };

    /**
     * Handles the deletion of a domain.
     * @param {string} domainId - The ID of the domain to delete.
     */
    const handleDeleteDomain = async (domainId) => {
        if (window.confirm("¿Seguro que quieres eliminar este dominio? Esta acción no se puede deshacer si no hay peticiones asociadas.")) {
            try {
                await deleteDomain(domainId);
                fetchDomains(); // Refresh the list
            } catch (err) {
                alert(`Error al eliminar el dominio: ${err.message}`);
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Panel Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Dominios Temáticos</h1>
                    <p className="text-slate-500 mt-1">Define las categorías en las que se clasificarán las necesidades de ayuda.</p>
                </div>
            </div>
            
            {/* Form to add a new domain */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 mb-8">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Añadir Nuevo Dominio</h3>
                <form onSubmit={handleCreateDomain} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Nombre</label>
                            <input 
                                type="text"
                                value={newDomain.name}
                                onChange={(e) => setNewDomain({...newDomain, name: e.target.value})}
                                placeholder="Ej: Material Sanitario"
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">Descripción (Opcional)</label>
                            <input 
                                type="text"
                                value={newDomain.description}
                                onChange={(e) => setNewDomain({...newDomain, description: e.target.value})}
                                placeholder="Ej: Sillas de ruedas, muletas..."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md">
                            Guardar Dominio
                        </button>
                    </div>
                </form>
            </div>

            {/* List of existing domains */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Dominios Activos</h3>
                </div>
                {isLoading && <p className="text-center py-10 text-slate-500">Cargando dominios...</p>}
                {error && <p className="text-red-500 text-center py-10">Error: {error}</p>}
                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-6">Nombre del Dominio</th>
                                    <th className="py-3 px-6">Descripción</th>
                                    <th className="py-3 px-6 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {domains.length > 0 ? domains.map(domain => (
                                    <tr key={domain.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-6 font-bold text-slate-800">{domain.name}</td>
                                        <td className="py-4 px-6 text-slate-600">{domain.description || '—'}</td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleDeleteDomain(domain.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                title="Eliminar dominio"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-10 text-center text-slate-400 italic">No hay dominios creados aún.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DomainManagementPanel;
