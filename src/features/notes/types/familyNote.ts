export interface NoteAuthor {
  id: string;
  name: string;
  color: string;
}

export interface FamilyNote {
  id: string;
  title: string;
  body: string;
  icon: string;
  color: string;
  isImportant: boolean;
  expiresOn: string | null;
  createdBy: NoteAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyNoteInput {
  title: string;
  body: string;
  icon: string;
  color: string;
  isImportant: boolean;
  expiresOn: string | null;
}
