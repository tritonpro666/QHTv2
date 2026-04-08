export const COEXISTENCE_CASES = [
    {
        id: 'c1',
        title: "El Celular Perdido",
        description: "Al Seba se le perdió el celu en el camarín y anda diciendo que fue el Mati porque le cae mal.",
        qhtOptions: [
            { text: "Echarle la foca al Mati de una", type: 'AGGRESSIVE', impact: -10 },
            { text: "Ayudar a buscar piola", type: 'EMPATHY', impact: 20 },
            { text: "Hacerse el loco", type: 'PASSIVE', impact: 0 }
        ],
        required: ['RESPECT', 'EMPATHY'],
        difficulty: 1
    },
    {
        id: 'c2',
        title: "El Trabajo en Grupo",
        description: "Queda un día para entregar y la Javi no ha hecho nada de su parte del informe.",
        qhtOptions: [
            { text: "Sacarla del grupo a la mala", type: 'AGGRESSIVE', impact: -10 },
            { text: "Preguntarle qué le pasa", type: 'EMPATHY', impact: 20 },
            { text: "Hacer su parte callado", type: 'PASSIVE', impact: 5 }
        ],
        required: ['COMMITMENT', 'INCLUSION'],
        difficulty: 1
    },
    {
        id: 'c3',
        title: "La Broma Pesada",
        description: "Subieron un meme del profe a Insta y todos se ríen, pero el profe se ve bajoneado.",
        qhtOptions: [
            { text: "Darle like y compartir", type: 'AGGRESSIVE', impact: -20 },
            { text: "No pescar la publicación", type: 'PASSIVE', impact: 5 },
            { text: "Decir que corten el webeo", type: 'RESPECT', impact: 20 }
        ],
        required: ['RESPECT', 'EMPATHY'],
        difficulty: 2
    },
    {
        id: 'c4',
        title: "El Nuevo del Curso",
        description: "Llegó un compañero nuevo que habla poco y se sienta solo al fondo.",
        qhtOptions: [
            { text: "Dejarlo tranquilo nomás", type: 'PASSIVE', impact: 0 },
            { text: "Invitarlo a la pichanga", type: 'INCLUSION', impact: 20 },
            { text: "Mirarlo feo", type: 'AGGRESSIVE', impact: -10 }
        ],
        required: ['INCLUSION', 'EMPATHY'],
        difficulty: 1
    }
];

export const ARGUMENT_CARDS = [
    // RESPETO -> "La Buena Onda" / "Respeto"
    { id: 'r1', type: 'RESPECT', title: "¡Tranquilein!", desc: "Bajarle un cambio a la discusión.", power: 10 },
    { id: 'r2', type: 'RESPECT', title: "Hablemos Piola", desc: "Conversar sin gritarse.", power: 12 },
    { id: 'r3', type: 'RESPECT', title: "Cortar el Webeo", desc: "Poner límites claros pero firmes.", power: 15 },

    // INCLUSION -> "El Lote" / "Inclusión"
    { id: 'i1', type: 'INCLUSION', title: "Invitar al Lote", desc: "Sumar a alguien al grupo.", power: 10 },
    { id: 'i2', type: 'INCLUSION', title: "Abrir la Cancha", desc: "Dar espacio a nuevas ideas.", power: 12 },
    { id: 'i3', type: 'INCLUSION', title: "Cero Atado", desc: "Aceptar a todos como son.", power: 15 },

    // COMPROMISO -> "Apañar" / "Compromiso"
    { id: 'c1', type: 'COMMITMENT', title: "Hacer la Segunda", desc: "Apoyar a un compañero en todas.", power: 10 },
    { id: 'c2', type: 'COMMITMENT', title: "Ponerse la Camiseta", desc: "Comprometerse con el objetivo.", power: 12 },
    { id: 'c3', type: 'COMMITMENT', title: "Cumplir la Palabra", desc: "Si dijiste que sí, es sí.", power: 15 },

    // EMPATIA -> "Ser Tela" / "Empatía"
    { id: 'e1', type: 'EMPATHY', title: "Ser Tela", desc: "Ser amable y buena gente.", power: 10 },
    { id: 'e2', type: 'EMPATHY', title: "Ponerse en sus Tillas", desc: "Entender lo que siente el otro.", power: 12 },
    { id: 'e3', type: 'EMPATHY', title: "Apañe Emocional", desc: "Escuchar cuando alguien está mal.", power: 15 },
];
