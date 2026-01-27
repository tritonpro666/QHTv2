async function testHistory() {
    try {
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: "Hola de nuevo",
                history: [
                    { role: 'user', text: 'Hola Sofo' },
                    { role: 'model', text: '¡Hola! ¿En qué puedo ayudarte?' }
                ]
            })
        });
        const data = await response.json();
        console.log("Respuesta con historia:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testHistory();
