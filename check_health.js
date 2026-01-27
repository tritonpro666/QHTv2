async function checkHealth() {
    try {
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        console.log("Salud del servidor:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error conectando al servidor:", e.message);
    }
}
checkHealth();
