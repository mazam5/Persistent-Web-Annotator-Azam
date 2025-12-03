import { Ban, Save } from 'lucide-react'
import React from 'react'

interface AddNoteFormProps {
  formData: Note
  setFormData: React.Dispatch<React.SetStateAction<Note>>
  onSave: (data: Note) => void
  onCancel: () => void
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
}) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSave?.(formData)
  }
  return (
    <div className="border">
      <form onSubmit={handleSubmit} className="rounded-lg p-4 shadow">
        <label className="mb-3 block">
          <span className="text-sm font-medium">Content Note</span>
          <input
            autoFocus
            type="text"
            name="content"
            id="content"
            min={4}
            maxLength={16}
            required
            className="w-full rounded border p-2"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Write your note..."
          />
        </label>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="flex gap-2 rounded border bg-green-600 px-4 py-2 text-white hover:bg-green-300"
          >
            <Save />
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex gap-2 rounded border px-4 py-2"
          >
            <Ban />
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddNoteForm
