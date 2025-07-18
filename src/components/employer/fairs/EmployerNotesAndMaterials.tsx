import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'note' | 'document' | 'link';
  url?: string;
  author: string;
}

interface EmployerNotesAndMaterialsProps {
  notes: Note[];
  onAddNote: () => void;
  onEditNote: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export function EmployerNotesAndMaterials({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote
}: EmployerNotesAndMaterialsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getTypeIcon = (type: Note['type']) => {
    switch (type) {
      case 'note': return <FileText className="h-5 w-5 text-indigo-600" />;
      case 'document': return <Download className="h-5 w-5 text-green-600" />;
      case 'link': return <LinkIcon className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeLabel = (type: Note['type']) => {
    switch (type) {
      case 'note': return 'Note';
      case 'document': return 'Document';
      case 'link': return 'Link';
    }
  };

  const getTypeColor = (type: Note['type']) => {
    switch (type) {
      case 'note': return 'bg-indigo-100 text-indigo-800';
      case 'document': return 'bg-green-100 text-green-800';
      case 'link': return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Team Notes & Materials</h2>
        <button 
          onClick={onAddNote}
          className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Note
        </button>
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    note.type === 'note' ? 'bg-indigo-100' :
                    note.type === 'document' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {getTypeIcon(note.type)}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{note.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{note.author}</span>
                      <span>•</span>
                      <span>{note.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                    {getTypeIcon(note.type)}
                    <span className="ml-1">{getTypeLabel(note.type)}</span>
                  </span>
                  <button
                    onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                    className="p-1 text-gray-400 hover:text-gray-500"
                  >
                    {expandedId === note.id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={`p-4 ${expandedId === note.id ? 'block' : 'hidden'}`}>
              <div className="mb-4">
                {note.type === 'note' ? (
                  <p className="text-sm text-gray-600 whitespace-pre-line">{note.content}</p>
                ) : note.type === 'document' ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{note.content}</span>
                    <button className="flex items-center text-sm text-indigo-600 hover:text-indigo-500">
                      <Download className="h-4 w-4 mr-1.5" />
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">{note.content}</span>
                    <a 
                      href={note.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-1.5" />
                      Visit Link
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">Created on {note.date}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditNote(note.id)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    <Edit className="h-4 w-4 mr-1.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}