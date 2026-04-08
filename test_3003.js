import fs from 'fs';

async function testFull() {
    try {
        const response = await fetch('http://localhost:3003/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hola Sofo, responde con un saludo breve." })
        });
        const data = await response.json();
        fs.writeFileSync('test_output_3003.json', JSON.stringify(data, null, 2));
        console.log("Resultado guardado en test_output_3003.json");
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testFull();
