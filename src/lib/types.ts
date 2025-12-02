export interface Note {
  id: string;
  url: string;
  content: string;
  domLocator: string;
  createdAt: number;
}

export interface StoredNotes {
  notes: Note[];
}
