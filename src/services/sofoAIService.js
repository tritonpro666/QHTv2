class SofoAIService {
    async sendMessage(userMessage, userContext, history = []) {
        try {
            console.log("[Sofo AI] Enviando mensaje:", { 
                message: userMessage, 
                historyLength: history.length,
                user: userContext?.email 
            });

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

                console.error("[Sofo AI] Error de respuesta:", { status: response.status, message: errorMsg });

                return {
                    isCritical: false,
                    isQuotaError: response.status === 429,
                    response: errorMsg
                };
            }

            const data = await response.json();
            console.log("[Sofo AI] Respuesta recibida:", data);
            return data;
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
