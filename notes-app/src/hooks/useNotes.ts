import { useState, useEffect } from 'react';
import { type Note } from '@/types/note';
import { useAuth } from '@/contexts/AuthContext';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { username } = useAuth();

  const getStorageKey = () => `notes_${username}`;

  useEffect(() => {
    if (username) {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotes(parsed.sort((a: Note, b: Note) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ));
        } catch (e) {
          console.error('Failed to load notes:', e);
          setNotes([]);
        }
      }
    }
  }, [username]);

  const saveNotes = (newNotes: Note[]) => {
    if (username) {
      const sorted = [...newNotes].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      localStorage.setItem(getStorageKey(), JSON.stringify(sorted));
      setNotes(sorted);
    }
  };

  const createNote = (title: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveNotes([...notes, newNote]);
    return newNote;
  };

  const updateNote = (id: string, title: string, content: string) => {
    const updated = notes.map(note =>
      note.id === id
        ? { ...note, title, content, updatedAt: new Date().toISOString() }
        : note
    );
    saveNotes(updated);
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(note => note.id !== id));
  };

  return { notes, createNote, updateNote, deleteNote };
}
