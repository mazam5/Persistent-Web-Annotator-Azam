import { Note } from "@/lib/types";
import { Ban, Save } from "lucide-react";
import React from "react";

interface AddNoteFormProps {
    formData: Note;
    setFormData: React.Dispatch<React.SetStateAction<Note>>;
    onSave: (data: Note) => void;
    onCancel: () => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({ formData, setFormData, onSave, onCancel }) => {

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSave?.(formData);
    };
    return (
        <div className="border">
            <form onSubmit={handleSubmit} className="p-4 rounded-lg shadow">
                <label className="block mb-3">
                    <span className="font-medium text-sm">Content Note</span>
                    <input
                        autoFocus
                        type="text"
                        name="content"
                        id="content"
                        min={4}
                        maxLength={16}
                        required
                        className="w-full p-2 border rounded"
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your note..."
                    />
                </label>

                <div className="flex gap-2 mt-4">
                    <button type="submit" className="px-4 border flex gap-2 py-2 bg-green-600 hover:bg-green-300 text-white rounded">
                        <Save />
                        Save
                    </button>
                    <button type="button" onClick={onCancel} className=" border px-4 py-2 rounded flex gap-2">
                        <Ban />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNoteForm;
