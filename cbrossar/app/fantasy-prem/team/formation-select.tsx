"use client";

export default function FormationSelect({
    formation,
    setFormation,
}: {
    formation: string;
    setFormation: (formation: string) => void;
}) {
    // Define available formations
    const formations = [
        { label: "1-3-5-2", value: "1-3-5-2" },
        { label: "1-4-4-2", value: "1-4-4-2" },
        { label: "1-3-4-3", value: "1-3-4-3" },
        { label: "2-5-5-3", value: "2-5-5-3" },
    ];

    return (
        <div className="formation-select-container">
            <label htmlFor="formation-select">Formation:</label>
            <select
                id="formation-select"
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="formation-select"
            >
                {formations.map((formation) => (
                    <option key={formation.value} value={formation.value}>
                        {formation.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
