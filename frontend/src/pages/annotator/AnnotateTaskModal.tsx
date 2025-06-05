import React, { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { annotatorApi, Task, adminApi } from "../../utils/api";

type Props = {
    task: Task;
    userId: string;
    onClose: () => void;
    onSave?: () => void;
};

const AnnotateTaskModal: React.FC<Props> = ({ task, userId, onClose, onSave }) => {
    const [selectedClass, setSelectedClass] = useState(task.annotations?.[0] || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [classes, setClasses] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDatasetClasses = async () => {
            try {
                const datasetDetails = await adminApi.getDatasetById(String(task.datasetId));
                if (datasetDetails.classes) {
                    const classArray = datasetDetails.classes.split(';').map(cls => cls.trim());
                    setClasses(classArray);
                }
            } catch (err) {
                console.error('Error fetching dataset classes:', err);
                setError('Failed to load dataset classes');
            } finally {
                setLoading(false);
            }
        };

        fetchDatasetClasses();
    }, [task.datasetId]);

    const handleSave = async () => {
        if (!selectedClass) {
            setError("Please select a class");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await annotatorApi.updateTaskAnnotation(task.id, userId, selectedClass);
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
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Class:
                    </label>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {classes.map((cls: string, index: number) => (
                                <button
                                    key={index}
                                    className={`p-3 rounded-lg border transition-all ${selectedClass === cls
                                        ? 'bg-teal-600 text-white border-teal-600'
                                        : 'bg-white hover:bg-gray-50 border-gray-200'
                                        }`}
                                    onClick={() => setSelectedClass(cls)}
                                >
                                    {cls}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {error && <div className="text-red-600 mb-2">{error}</div>}
                <div className="flex justify-end space-x-2">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        onClick={onClose}
                        disabled={saving || loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                        onClick={handleSave}
                        disabled={saving || loading}
                    >
                        {saving ? "Saving..." : "Save Annotation"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AnnotateTaskModal;