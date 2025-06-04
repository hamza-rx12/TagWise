import React, { useState } from "react";
import Modal from "../../components/Modal";
import { annotatorApi, Task } from "../../utils/api";

type Props = {
    task: Task;
    userId: string;
    onClose: () => void;
    onSave?: () => void;
};

const AnnotateTaskModal: React.FC<Props> = ({ task, userId, onClose, onSave }) => {
    const [annotation, setAnnotation] = useState(task.annotations?.[0] || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            // Ici tu dois appeler ton API pour sauvegarder l'annotation
            await annotatorApi.updateTaskAnnotation(task.id, userId, annotation);
            // Optionnel : rafraîchir la liste des tâches
            if (onSave) onSave();
            onClose();
        } catch (err) {
            setError("Failed to save annotation.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Annotate Task #{task.id}</h2>
                <div className="mb-4">
                    <div className="mb-2">
                        <span className="font-semibold">Text 1:</span> {task.text1}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Text 2:</span> {task.text2}
                    </div>
                </div>
                <textarea
                    className="w-full border rounded-lg p-2 mb-4"
                    rows={4}
                    value={annotation}
                    onChange={e => setAnnotation(e.target.value)}
                    placeholder="Enter your annotation here..."
                />
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Annotation"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AnnotateTaskModal;