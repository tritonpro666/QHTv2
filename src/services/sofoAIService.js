class SofoAIService {
    async sendMessage(userMessage, userContext, history = []) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    history: history,
                    context: userContext ? {
                        name: userContext.name,
                        email: userContext.email
                    } : null
                })
            });

            // Handle non-JSON or error responses gracefully
            if (!response.ok) {
                let errorMsg = 'Error en el servidor';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.response || errorMsg;
                } catch (e) {
                    // If response is not JSON (e.g. 500 error from proxy being down)
                    if (response.status === 500) {
                        errorMsg = "El servidor de IA no está respondiendo. Por favor, asegúrate de que el backend esté corriendo.";
                    }
                }

                return {
                    isCritical: false,
                    isQuotaError: response.status === 429,
                    response: errorMsg
                };
            }

            return await response.json();
        } catch (error) {
            console.error("[Sofo AI] Error al comunicarse con el backend:", error);
            return {
                isCritical: false,
                response: "No pude conectarme con Sofo. Revisa tu conexión a internet o si el servidor está activo."
            };
        }
    }
}

export const sofoAI = new SofoAIService();
