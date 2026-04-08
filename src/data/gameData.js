export const ROLES = [
    {
        id: 'matea',
        name: 'La Matea',
        description: 'Siempre tiene la respuesta correcta y conoce el reglamento de memoria.',
        maxHp: 120,
        maxEnergy: 60,
        str: 5, int: 15,
        cutinQuote: '¡SEGÚN EL MANUAL DE CONVIVENCIA, ARTÍCULO 4... QUEDAS FUERA!',
        weakness: 'fire',
        cards: [
            { id: 'matea_1', title: 'Citar RICE', desc: 'Recita el artículo exacto del reglamento para calmar la situación.', damage: 30, cost: 20, riceFactor: 1.0 },
            { id: 'matea_2', title: 'Plan de Estudio', desc: 'Propone una sesión de estudio grupal para resolver el conflicto.', damage: 20, cost: 15, riceFactor: 0.8 },
            { id: 'matea_3', title: 'Liderazgo Positivo', desc: 'Organiza a los compañeros para una solución constructiva.', damage: 25, cost: 30, riceFactor: 0.9 },
            { id: 'matea_4', title: 'Mediación Académica', desc: 'Usa su prestigio con los profes para pedir una segunda oportunidad.', damage: 20, cost: 25, riceFactor: 0.7 }
        ],
        battleCards: [
            { id: 'matea_b1', title: 'Golpe de Libro', type: 'attack', element: 'earth', desc: 'Lanza un libro pesado al enemigo.', damage: 25, cost: 15, riceFactor: 0.9 },
            { id: 'matea_b2', title: 'Conocimiento Letal', type: 'attack', element: 'ice', desc: 'Usa datos y lógica para confundir al oponente.', damage: 30, cost: 20, riceFactor: 1.0 },
            { id: 'matea_b3', title: 'Primeros Auxilios', type: 'heal', desc: 'Cura a un compañero herido.', healAmount: 0.3, target: 'single', cost: 25 },
            { id: 'matea_b4', title: 'Sesión de Estudio', type: 'buff', desc: 'Aumenta el ataque de todo el equipo.', stat: 'attack', amount: 1.3, duration: 2, target: 'all', cost: 30 },
            { id: 'matea_b5', title: 'Reanimación CPR', type: 'revive', desc: 'Revive a un compañero caído.', target: 'single', cost: 40 }
        ]
    },
    {
        id: 'gracioso',
        name: 'El Gracioso',
        description: 'Usa el humor para romper la tensión, aunque a veces se le pasa la mano.',
        maxHp: 110,
        maxEnergy: 55,
        str: 8, int: 12,
        cutinQuote: '¡PREPÁRATE PARA EL REMATE FINAL!',
        weakness: 'electric',
        cards: [
            { id: 'gracioso_1', title: 'Chiste Inoportuno', desc: 'Lanza un chiste que hace reír a todos y baja la tensión.', damage: 20, cost: 15, riceFactor: 0.6 },
            { id: 'gracioso_2', title: 'Imitación del Inspector', desc: 'Desvía la atención imitando a una autoridad con humor.', damage: 25, cost: 25, riceFactor: 0.5 },
            { id: 'gracioso_3', title: 'Stand-up de Recreo', desc: 'Convierte el conflicto en una anécdota divertida.', damage: 15, cost: 10, riceFactor: 0.7 },
            { id: 'gracioso_4', title: 'Meme en Vivo', desc: 'Actúa una situación viral para confundir y relajar el ambiente.', damage: 30, cost: 40, riceFactor: 0.4 }
        ],
        battleCards: [
            { id: 'gracioso_b1', title: 'Broma Mortal', type: 'attack', element: 'wind', desc: 'Un chiste tan malo que duele.', damage: 22, cost: 12, riceFactor: 0.7 },
            { id: 'gracioso_b2', title: 'Combo de Risa', type: 'attack', element: 'wind', desc: 'Una secuencia de chistes que aturde.', damage: 28, cost: 18, riceFactor: 0.8 },
            { id: 'gracioso_b3', title: 'Terapia de Risa', type: 'heal', desc: 'Cura a todo el equipo con humor.', healAmount: 0.2, target: 'all', cost: 30 },
            { id: 'gracioso_b4', title: 'Motivación Cómica', type: 'energy', desc: 'Restaura energía de todos.', energyAmount: 0.3, target: 'all', cost: 25 }
        ]
    },
    {
        id: 'nino_rata',
        name: 'El Niño Rata',
        description: 'Experto en tecnología y redes, vive conectado al mundo virtual.',
        maxHp: 100,
        maxEnergy: 70,
        str: 6, int: 14,
        cutinQuote: '¡GG EZ! ¡NOCLIP HACK ACTIVATED!',
        weakness: 'water',
        cards: [
            { id: 'rata_1', title: 'Hacker de Casino', desc: 'Consigue comida extra alterando el sistema (digitalmente).', damage: 35, cost: 35, riceFactor: 0.4 },
            { id: 'rata_2', title: 'Directo en Twitch', desc: 'Empieza a transmitir la situación buscando apoyo de sus "viewers".', damage: 15, cost: 20, riceFactor: 0.5 },
            { id: 'rata_3', title: 'Spam de Ayuda', desc: 'Inunda los grupos de WhatsApp con mensajes para resolver el lío.', damage: 20, cost: 15, riceFactor: 0.8 },
            { id: 'rata_4', title: 'Lag Mental', desc: 'Finge una desconexión total para evitar el conflicto.', damage: 10, cost: 5, riceFactor: 0.6 }
        ],
        battleCards: [
            { id: 'rata_b1', title: 'Hackeo Letal', type: 'attack', element: 'electric', desc: 'Sobrecarga el sistema del enemigo.', damage: 32, cost: 22, riceFactor: 0.6 },
            { id: 'rata_b2', title: 'Virus Digital', type: 'attack', element: 'electric', desc: 'Infecta al enemigo con malware.', damage: 26, cost: 16, riceFactor: 0.7 },
            { id: 'rata_b3', title: 'Boost de Red', type: 'buff', desc: 'Aumenta la velocidad del equipo.', stat: 'defense', amount: 1.4, duration: 3, target: 'all', cost: 28 },
            { id: 'rata_b4', title: 'Recarga USB', type: 'energy', desc: 'Restaura energía de un aliado.', energyAmount: 0.5, target: 'single', cost: 20 }
        ]
    },
    {
        id: 'selfie',
        name: 'La Niña de las Selfies',
        description: 'Todo es contenido para sus historias. La imagen lo es todo.',
        maxHp: 105,
        maxEnergy: 65,
        str: 7, int: 13,
        cutinQuote: '¡ESTA FUNA SE VA A HACER VIRAL!',
        weakness: 'wind',
        cards: [
            { id: 'selfie_1', title: 'Story de Denuncia', desc: 'Graba un video mostrando la injusticia para que se haga viral.', damage: 25, cost: 20, riceFactor: 0.7 },
            { id: 'selfie_2', title: 'Filtro Divino', desc: 'Embellece la situación para que no parezca tan grave en redes.', damage: 20, cost: 25, riceFactor: 0.5 },
            { id: 'selfie_3', title: 'Influencer de Paz', desc: 'Usa sus seguidores para promover una solución pacífica.', damage: 15, cost: 15, riceFactor: 0.9 },
            { id: 'selfie_4', title: 'Tiktok de Coexistencia', desc: 'Hace un baile con los involucrados para sellar la paz.', damage: 35, cost: 45, riceFactor: 0.8 }
        ],
        battleCards: [
            { id: 'selfie_b1', title: 'Flash Cegador', type: 'attack', element: 'fire', desc: 'Ciega al enemigo con el flash.', damage: 24, cost: 14, riceFactor: 0.8 },
            { id: 'selfie_b2', title: 'Golpe Viral', type: 'attack', element: 'fire', desc: 'Un ataque que se vuelve tendencia.', damage: 30, cost: 20, riceFactor: 0.9 },
            { id: 'selfie_b3', title: 'Filtro de Curación', type: 'heal', desc: 'Embellece y cura a un aliado.', healAmount: 0.35, target: 'single', cost: 22 },
            { id: 'selfie_b4', title: 'Boost de Seguidores', type: 'buff', desc: 'Aumenta el ataque de un aliado.', stat: 'attack', amount: 1.5, duration: 2, target: 'single', cost: 26 }
        ]
    },
    {
        id: 'dormilona',
        name: 'La Dormilona',
        description: 'Puede dormir en cualquier lugar. Su calma es imperturbable.',
        maxHp: 140,
        maxEnergy: 50,
        str: 10, int: 8,
        cutinQuote: 'Zzz... ah... ¡YA DESPERTÉ!',
        weakness: 'ice',
        cards: [
            { id: 'dormir_1', title: 'Sueño Profundo', desc: 'Ignora el conflicto tan fuerte que los demás se calman.', damage: 10, cost: 10, riceFactor: 0.6 },
            { id: 'dormir_2', title: 'Siesta de Mediación', desc: 'Pide a todos que se relajen y tomen un descanso.', damage: 20, cost: 25, riceFactor: 0.9 },
            { id: 'dormir_3', title: 'Manta de Paz', desc: 'Comparte su comodidad para bajar los ánimos caldeados.', damage: 15, cost: 15, riceFactor: 0.8 },
            { id: 'dormir_4', title: 'Zzz Inesperado', desc: 'Su ronquido rompe un momento de tensión extrema.', damage: 40, cost: 50, riceFactor: 0.4 }
        ],
        battleCards: [
            { id: 'dormir_b1', title: 'Almohada Voladora', type: 'attack', element: 'wind', desc: 'Lanza su almohada con fuerza.', damage: 20, cost: 10, riceFactor: 0.7 },
            { id: 'dormir_b2', title: 'Bostezo Contagioso', type: 'attack', element: 'ice', desc: 'Un bostezo que debilita al enemigo.', damage: 18, cost: 12, riceFactor: 0.9 },
            { id: 'dormir_b3', title: 'Siesta Curativa', type: 'heal', desc: 'Cura a todo el equipo con descanso.', healAmount: 0.25, target: 'all', cost: 35 },
            { id: 'dormir_b4', title: 'Escudo de Cobija', type: 'buff', desc: 'Aumenta defensa de todos.', stat: 'defense', amount: 1.5, duration: 3, target: 'all', cost: 30 }
        ]
    },
    {
        id: 'atletico',
        name: 'El Atlético',
        description: 'Energía pura. Resuelve todo con movimiento y deporte.',
        maxHp: 130,
        maxEnergy: 55,
        str: 16, int: 4,
        cutinQuote: '¡ESTO ES POR EL EQUIPO, TOMA!',
        weakness: 'earth',
        cards: [
            { id: 'atleta_1', title: 'Pichanga de Paz', desc: 'Desvía el conflicto hacia un partido de fútbol rápido.', damage: 20, cost: 15, riceFactor: 1.0 },
            { id: 'atleta_2', title: 'Reflejos Felinos', desc: 'Ataja un objeto lanzado o evita una caída justo a tiempo.', damage: 30, cost: 30, riceFactor: 0.9 },
            { id: 'atleta_3', title: 'Entrenamiento Grupal', desc: 'Canaliza la rabia de los demás en ejercicio físico.', damage: 25, cost: 20, riceFactor: 0.8 },
            { id: 'atleta_4', title: 'Carrera de Auxilio', desc: 'Llega volando a buscar al inspector antes de que pase algo malo.', damage: 15, cost: 10, riceFactor: 0.9 }
        ],
        battleCards: [
            { id: 'atleta_b1', title: 'Patada Voladora', type: 'attack', element: 'fire', desc: 'Un golpe acrobático devastador.', damage: 35, cost: 20, riceFactor: 0.9 },
            { id: 'atleta_b2', title: 'Tackle Perfecto', type: 'attack', element: 'earth', desc: 'Embiste al enemigo con fuerza.', damage: 28, cost: 16, riceFactor: 1.0 },
            { id: 'atleta_b3', title: 'Masaje Deportivo', type: 'heal', desc: 'Cura a un aliado con técnicas deportivas.', healAmount: 0.4, target: 'single', cost: 24 },
            { id: 'atleta_b4', title: 'Grito de Guerra', type: 'buff', desc: 'Aumenta ataque de todos.', stat: 'attack', amount: 1.4, duration: 2, target: 'all', cost: 28 },
            { id: 'atleta_b5', title: 'Bebida Energética', type: 'energy', desc: 'Restaura energía de todo el equipo.', energyAmount: 0.4, target: 'all', cost: 32 }
        ]
    },
    {
        id: 'persuasivo',
        name: 'El Persuasivo',
        description: 'Tiene el don de la palabra. Puede convencer a cualquiera de cualquier cosa.',
        maxHp: 115,
        maxEnergy: 60,
        str: 9, int: 15,
        cutinQuote: '¡TE LO ADVERTÍ POR LAS BUENAS...!',
        weakness: 'water',
        cards: [
            { id: 'habla_1', title: 'Labia de Oro', desc: 'Habla tanto y tan bien que convence al agresor de rendirse.', damage: 40, cost: 35, riceFactor: 1.0 },
            { id: 'habla_2', title: 'Negociación Técnica', desc: 'Llega a un acuerdo donde todos ganan algo.', damage: 25, cost: 25, riceFactor: 0.9 },
            { id: 'habla_3', title: 'Discurso Inspirador', desc: 'Hace que todos se sientan parte de una comunidad unida.', damage: 30, cost: 30, riceFactor: 0.8 },
            { id: 'habla_4', title: 'Cuento del Tío (Soft)', desc: 'Confunde al oponente con argumentos lógicos pero circulares.', damage: 15, cost: 15, riceFactor: 0.5 }
        ],
        battleCards: [
            { id: 'habla_b1', title: 'Palabra Letal', type: 'attack', element: 'water', desc: 'Palabras que hieren más que golpes.', damage: 27, cost: 18, riceFactor: 1.0 },
            { id: 'habla_b2', title: 'Argumento Demoledor', type: 'attack', element: 'ice', desc: 'Destruye la moral del enemigo.', damage: 33, cost: 22, riceFactor: 0.9 },
            { id: 'habla_b3', title: 'Discurso Motivador', type: 'heal', desc: 'Inspira y cura a un aliado.', healAmount: 0.35, target: 'single', cost: 26 },
            { id: 'habla_b4', title: 'Estrategia Maestra', type: 'buff', desc: 'Aumenta ataque y defensa de un aliado.', stat: 'attack', amount: 1.6, duration: 2, target: 'single', cost: 35 },
            { id: 'habla_b5', title: 'Revivir Esperanza', type: 'revive', desc: 'Convence a un caído de levantarse.', target: 'single', cost: 45 }
        ]
    }
];

export const SCENARIOS = [
    {
        id: 'case_1',
        type: 'CONVIVENCIA',
        title: 'El Mueble Volador',
        desc: 'Un estante viejo se cae en medio de la sala. Hay un estudiante atrapado debajo.'
    },
    {
        id: 'case_2',
        type: 'CONVIVENCIA',
        title: 'Alumno Aislado',
        desc: 'Un alumno se encuentra solo y aislado en un rincón del patio durante el recreo, visiblemente triste.'
    },
    {
        id: 'case_3',
        type: 'CONVIVENCIA',
        title: 'Sin Grupo',
        desc: 'Un alumno se queda sin grupo para un trabajo importante y nadie quiere incluirlo.'
    },
    {
        id: 'case_4',
        type: 'CONVIVENCIA',
        title: 'Pelea en el Casino',
        desc: 'Se armó una trifulca masiva por el último plato de comida del día.'
    }
];

export const PHONE_CONTACTS = [
    {
        id: 'prof_jefe',
        name: 'Profesor Jefe',
        role: 'Autoridad',
        desc: 'Llega a poner orden. Causa DAÑO al rival.',
        cost: 40,
        effect: { type: 'damage', amount: 80 },
        icon: 'grad'
    },
    {
        id: 'inspector',
        name: 'Inspector General',
        role: 'Máxima Autoridad',
        desc: 'Expulsa al problema. Causa DAÑO MASIVO. (Requiere llamar al Profesor antes)',
        cost: 60,
        req: 'prof_jefe',
        effect: { type: 'damage', amount: 150 },
        icon: 'school'
    },
    {
        id: 'orientadora',
        name: 'Orientadora',
        role: 'Apoyo',
        desc: 'Recupera 50% de energía a todos.',
        cost: 30,
        effect: { type: 'energy', amount: 0.5, target: 'all' },
        icon: 'heart'
    }
];

export const BOSSES = [
    {
        id: 'boss_1',
        type: 'GRAVE',
        title: 'Amenaza Extrema',
        desc: 'Un estudiante saca un arma de fuego y amenaza con disparar a quemarropa.',
        bossName: 'Alumno Armado',
        image: '/assets/villains/student_resented.png',
        maxHp: 400,
        maxEnergy: 100,
        weakness: 'water',
        resistance: 'fire',
        dialogues: [
            "¡Nadie se mueva o disparo!",
            "¡Estoy harto de que me ignoren!",
            "¡Esto se acaba ahora!",
            "¡No traten de detenerme!"
        ],
        skills: [
            { name: 'Disparo al Aire', type: 'attack', element: 'fire', damage: 25, cost: 20, target: 'all', desc: 'Dispara al techo causando pánico general.' },
            { name: 'Grito Desesperado', type: 'attack', element: 'wind', damage: 15, cost: 15, target: 'all', desc: 'Un grito que aturde y daña a todos.' },
            { name: 'Amenaza Directa', type: 'attack', element: 'fire', damage: 35, cost: 25, target: 'single', desc: 'Apunta a uno, pero el miedo afecta a todos.' }, // Modified logic to affect all in UI maybe? No, kept single big hit but maybe add splash
            { name: 'Recarga de Ira', type: 'buff', stat: 'attack', amount: 1.5, duration: 2, cost: 20, target: 'self', desc: 'Se prepara para un ataque devastador.' }
        ]
    },
    {
        id: 'boss_2',
        type: 'GRAVE',
        title: 'Intruso en el Liceo',
        desc: 'Un desconocido saltó la pandereta y amenaza con herramientas robadas.',
        bossName: 'Ladrón Violento',
        image: '/assets/villains/tool_thief.png',
        maxHp: 350,
        maxEnergy: 100,
        weakness: 'electric',
        resistance: 'earth',
        dialogues: [
            "¡Denme todo lo de valor!",
            "¡No se acerquen o usaré esto!",
            "¡Solo quiero irme, no me obliguen!",
            "¡Atrás!"
        ],
        skills: [
            { name: 'Lanzamiento de Llave', type: 'attack', element: 'earth', damage: 20, cost: 15, target: 'all', desc: 'Lanza herramientas a todo el grupo.' },
            { name: 'Golpe de Martillo', type: 'attack', element: 'earth', damage: 30, cost: 20, target: 'single', desc: 'Un golpe fuerte a quien esté más cerca.' },
            { name: 'Intimidación', type: 'debuff', stat: 'defense', amount: 0.8, duration: 2, cost: 10, target: 'all', desc: 'Baja la defensa de todos con amenazas.' },
            { name: 'Escape Frenético', type: 'buff', stat: 'speed', amount: 1.5, duration: 3, cost: 25, target: 'self', desc: 'Se mueve erráticamente, difícil de golpear.' }
        ]
    }
];

export const SHOP_ITEMS = [
    { id: 'pot_hp_1', name: 'Leche de Recreo', type: 'hp', value: 20, price: 100, desc: 'Recupera 20% de Vida' },
    { id: 'pot_hp_2', name: 'Almuerzo Junaeb', type: 'hp', value: 100, price: 400, desc: 'Recupera el 100% de Vida' },
    { id: 'pot_en_1', name: 'Bebida Energética', type: 'energy', value: 30, price: 150, desc: 'Recupera 30% de Energía' },
    { id: 'pot_mix_1', name: 'Colación Completa', type: 'both', value: 50, price: 350, desc: '50% Vida y Energía' },
    { id: 'pot_revive', name: 'Poción de Resurrección', type: 'resurrection', value: 100, price: 200, desc: 'Revive a un jugador con 100% HP y energía' }
];
