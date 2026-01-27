async function testEvaluation() {
    try {
        const response = await fetch('http://localhost:3001/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario: { title: "Caso de Prueba", desc: "Un estudiante no quiere compartir su almuerzo." },
                plays: [
                    { playerId: 1, name: "Juana", role: "Matea", cardTitle: "Reglamento", cardDesc: "Le recuerda el RICE sobre compartir." }
                ]
            })
        });
        const data = await response.json();
        console.log("Respuesta de Evaluación:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testEvaluation();
