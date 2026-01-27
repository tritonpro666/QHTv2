async function testServer() {
    try {
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hola Sofo, responde con un saludo breve." })
        });
        const data = await response.json();
        console.log("Respuesta del servidor:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error conectando al servidor:", e.message);
    }
}
testServer();
