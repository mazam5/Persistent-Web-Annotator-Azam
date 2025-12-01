import { Note } from '@/lib/types';
import { useEffect, useState } from 'react';
import AddNoteForm from './AddNoteForm';
import './App.css';

function App() {
  const [hasCalled, setHasCalled] = useState(false);
  const [formData, setFormData] = useState<Note>({
    id: crypto.randomUUID(),
    url: window.location.href,
    content: "",
    domLocator: "",
    createdAt: Date.now(),
  });

  useEffect(() => {
    chrome.runtime.onMessage.addListener((request) => {
      if (request.type === 'OPEN_EDITOR_AT_SELECTION') {
        setHasCalled(true);
      }
    })
    console.log(formData);
  }, []);

  const handleCancel = () => {
    setHasCalled(false);
  }

  const handleSaveNote = (data: Note) => {
    chrome.storage.local.set({ [data.id]: data });
    resetFormData();
    setHasCalled(false);
    console.log("Note Saved Successfully to Chrome Local Storage");
  }
  const resetFormData = () => {
    setFormData({
      id: crypto.randomUUID(),
      url: window.location.href,
      content: "",
      domLocator: "",
      createdAt: Date.now(),
    });
  }
  return (
    <div>
      {
        hasCalled && (
          <AddNoteForm onCancel={handleCancel} onSave={handleSaveNote} formData={formData} setFormData={setFormData} />
        )
      }
    </div>
  )
}

export default App
