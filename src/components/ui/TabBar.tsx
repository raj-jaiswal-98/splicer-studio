import React, { useState, useRef, useEffect } from 'react';
import { usePosterContext } from '../../context/PosterContext';
import { Plus, X } from 'lucide-react';

export const TabBar = () => {
  const { projects, activeProjectId, setActiveProject, addProject, removeProject, updateProjectName } = usePosterContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveEdit = () => {
    if (editingId) {
      updateProjectName(editingId, editName.trim() || 'Untitled Canvas');
      setEditingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingId(null);
  };

  return (
    <div style={{ display: 'flex', backgroundColor: 'var(--panel-bg)', borderBottom: '4px solid var(--text-color)', overflowX: 'auto' }}>
      {projects.map(project => {
        const isActive = project.id === activeProjectId;
        return (
          <div 
            key={project.id}
            onClick={() => {
              if (editingId !== project.id) setActiveProject(project.id);
            }}
            onDoubleClick={() => handleDoubleClick(project.id, project.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem 1rem',
              backgroundColor: isActive ? 'var(--card-bg)' : 'transparent',
              borderRight: '4px solid var(--text-color)',
              borderBottom: isActive ? 'none' : '4px solid transparent',
              marginBottom: isActive ? '-4px' : '0',
              fontWeight: 'bold',
              cursor: 'pointer',
              minWidth: '120px',
              gap: '0.5rem'
            }}
          >
            {editingId === project.id ? (
              <input 
                ref={inputRef}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={handleKeyDown}
                style={{ 
                  backgroundColor: 'var(--bg-color)', 
                  color: 'var(--text-color)', 
                  border: '2px solid var(--text-color)',
                  padding: '0.1rem 0.25rem',
                  width: '100px',
                  fontWeight: 'bold'
                }}
              />
            ) : (
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {project.name}
              </span>
            )}
            
            {projects.length > 1 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  removeProject(project.id);
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--text-color)', 
                  cursor: 'pointer',
                  opacity: 0.5,
                  padding: '0.1rem'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}
      
      <button 
        onClick={addProject}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem 1rem',
          backgroundColor: 'transparent',
          borderRight: '4px solid var(--text-color)',
          color: 'var(--text-color)',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--text-color)', e.currentTarget.style.color = 'var(--bg-color)')}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = 'var(--text-color)')}
      >
        <Plus size={20} />
      </button>
    </div>
  );
};
