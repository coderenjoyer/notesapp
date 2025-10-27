import { Card, CardContent } from '@/components/ui/card';
import { type Note } from '@/types/note';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div 
            className="flex-1 cursor-pointer" 
            onClick={() => onEdit(note)}
          >
            <h3 className="font-semibold text-lg mb-1 line-clamp-1">
              {note.title || 'Untitled Note'}
            </h3>
            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
              {note.content}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(note.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
