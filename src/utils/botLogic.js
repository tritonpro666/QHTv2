import { ROLES, SCENARIOS } from '../data/gameData';

export const botLogic = {
    // Determine bot action based on current state
    decideAction: (gameState, botId) => {
        const { phase, turn, players } = gameState;

        // Random thinking time: 1.5s to 3s
        const delay = Math.random() * 1500 + 1500;

        return new Promise((resolve) => {
            setTimeout(() => {
                if (phase === 'SCENARIO' && turn === botId) {
                    // Bot starts round - pick random scenario
                    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
                    resolve({
                        type: 'DRAW_SCENARIO',
                        payload: scenario
                    });
                }

                else if (phase === 'ACTION' && turn === botId) {
                    // Bot plays card - must be one from its role
                    const botPlayer = players.find(p => p.id === botId);
                    if (!botPlayer) return resolve(null);

                    const role = ROLES.find(r => r.id === botPlayer.roleId);
                    if (!role) return resolve(null);

                    const card = role.cards[Math.floor(Math.random() * role.cards.length)];

                    resolve({
                        type: 'PLAY_CARD',
                        payload: {
                            id: `card_bot_${Date.now()}`,
                            owner: botId,
                            type: 'action',
                            title: card.title,
                            desc: card.desc,
                            role: role.name
                        }
                    });
                }

                else {
                    resolve(null);
                }
            }, delay);
        });
    }
};
