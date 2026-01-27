class SofoEvaluationService {
    async evaluate(scenario, plays) {
        try {
            const response = await fetch('/api/evaluate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ scenario, plays })
            });

            if (!response.ok) {
                throw new Error('Error en la evaluación');
            }

            return await response.json();
        } catch (error) {
            console.error("[Sofo Eval] Error:", error);
            // Fallback mock evaluation
            return {
                ranking: plays.map((p, i) => ({
                    playerId: p.playerId,
                    score: 8 - i,
                    feedback: "Tu acción fue valiosa para la comunidad."
                })),
                winnerId: plays[0].playerId,
                sofoComment: "¡Buen trabajo a todos! Sigamos construyendo una mejor convivencia."
            };
        }
    }
}

export const sofoEval = new SofoEvaluationService();
