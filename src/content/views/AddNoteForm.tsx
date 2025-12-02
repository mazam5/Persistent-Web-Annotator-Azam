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
        <div className="border p-5">
            <h2 className="text-xl font-bold m-5">New Note</h2>
            <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow">

                <label className="block mb-3">
                    <span className="font-medium text-sm">Content</span>
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
                    <button type="submit" className="px-4 border flex gap-2 py-2 bg-blue-600 text-white rounded">
                        <Save />
                        Save
                    </button>
                    <button type="button" onClick={onCancel} className=" border px-4 py-2 bg-gray-300 rounded flex gap-2">
                        <Ban />
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNoteForm;
