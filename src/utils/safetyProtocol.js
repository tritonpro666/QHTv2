/**
 * Safety Protocol for Sofo Chatbot
 * Handles detection of critical threats and administration reporting.
 */

const ADMIN_EMAIL = "m.riverasoto@liceorbl.cl";

// Keywords or patterns that might trigger a safety review (client-side pre-check)
// Note: The AI itself is the primary filter, but this helps tagging.
// We are trusting the AI to classify "CRITICAL" intent, but we can also have a fallback.

export const safetyProtocol = {
    /**
     * Determines if a message requires immediate admin attention.
     * @param {string} category - Category returned by AI (e.g., "SUICIDE", "VIOLENCE", "HARASSMENT")
     * @returns {boolean}
     */
    isCritical: (category) => {
        const CRITICAL_CATEGORIES = ['SUICIDE_SELF_HARM', 'VIOLENCE_WEAPONS', 'SEVERE_HARASSMENT', 'CRIME_PLANNING', 'SEXUAL_VIOLENCE'];
        return CRITICAL_CATEGORIES.includes(category);
    },

    /**
     * Triggers an alert to the administration.
     * In a real app, this would call an API endpoint to send an email.
     * Here, we simulate it with a detailed console log and (optionally) could trigger a UI notification.
     */
    triggerAdminAlert: (user, incidentDetails) => {
        const timestamp = new Date().toLocaleString();

        const report = {
            to: ADMIN_EMAIL,
            subject: `[ALERTA SOFO] Amenaza Detectada - ${incidentDetails.category}`,
            priority: 'URGENT',
            timestamp: timestamp,
            student_data: {
                name: user?.name || "Desconocido",
                email: user?.email || "No registrado",
                // Add more user fields if available from store
            },
            incident: {
                category: incidentDetails.category,
                reason: incidentDetails.reason,
                message_context: incidentDetails.message
            }
        };

        console.group("%c🚨 ALERTA DE SEGURIDAD CRÍTICA 🚨", "background:red; color:white; font-size:20px; padding:10px;");
        console.log("Enviando reporte a:", ADMIN_EMAIL);
        console.table(report.student_data);
        console.log("Detalles del Incidente:", report.incident);
        console.groupEnd();

        // TODO: Integrate EmailJS or backend service here.
        // Alerting the user happening? Usually standard safety protocol is to provide helplines to user
        // and silently notify admin to avoid escalating user panic if not needed, 
        // OR notify user that "Un adulto ha sido notificado" depending on school policy.
        // For this requirement: "debe mandar un correo... y un mensaje de advertencia"

        return {
            sent: true,
            reportId: `REP-${Date.now()}`
        };
    }
};
