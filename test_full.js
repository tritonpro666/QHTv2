import fs from 'fs';

async function testFull() {
    try {
        const response = await fetch('http://localhost:3001/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "Hola" })
        });
        const data = await response.json();
        fs.writeFileSync('test_output.json', JSON.stringify(data, null, 2));
        console.log("Resultado guardado en test_output.json");
    } catch (e) {
        console.error("Error:", e.message);
    }
}
testFull();
