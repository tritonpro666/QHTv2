import { useGameStore } from '../store/gameStore';

const translations = {
    es: {
        menu: {
            play: "Jugar Partida",
            playDesc: "Únete a una sala y demuestra tus habilidades.",
            start: "Comenzar",
            store: "Tienda",
            tutorial: "Tutorial",
            settings: "Ajustes",
            logout: "Salir",
        },
        settings: {
            title: "Ajustes",
            volume: "Volumen",
            language: "Idioma",
            highContrast: "Alto Contraste",
            secretCode: "Código Secreto",
            enterCode: "Ingresa tu código...",
            redeem: "Canjear",
            success: "¡Código canjeado!",
            error: "Código inválido",
        },
        store: {
            title: "Tienda Escolar",
            subtitle: "¡Personaliza tu estilo!",
            bought: "Comprado",
            buy: "Comprar",
        },
        profile: {
            title: "Mi Perfil",
            equipped: "Equipado",
            equip: "Equipar",
            closet: "Tu Armario",
            specialty: "Especialidad",
            selectSpecialty: "Elige tu especialidad",
            specs: {
                elec: "Electricidad",
                tron: "Electrónica",
                tele: "Telecomunicaciones",
                prog: "Programación"
            }
        },
        daily: {
            title: "Recompensa Diaria",
            spin: "¡Girar!",
            won: "¡Ganaste!",
            comeBack: "Vuelve mañana",
            points: "puntos",
        }
    },
    en: {
        menu: {
            play: "Play Game",
            playDesc: "Join a room and show your skills.",
            start: "Start",
            store: "Store",
            tutorial: "Tutorial",
            settings: "Settings",
            logout: "Logout",
        },
        settings: {
            title: "Settings",
            volume: "Volume",
            language: "Language",
            highContrast: "High Contrast",
            secretCode: "Secret Code",
            enterCode: "Enter code...",
            redeem: "Redeem",
            success: "Code redeemed!",
            error: "Invalid code",
        },
        store: {
            title: "School Store",
            subtitle: "Customize your style!",
            bought: "Owned",
            buy: "Buy",
        },
        profile: {
            title: "My Profile",
            equipped: "Equipped",
            equip: "Equip",
            closet: "Your Closet",
            specialty: "Specialty",
            selectSpecialty: "Choose your specialty",
            specs: {
                elec: "Electricity",
                tron: "Electronics",
                tele: "Telecommunications",
                prog: "Programming"
            }
        },
        daily: {
            title: "Daily Reward",
            spin: "Spin!",
            won: "You Won!",
            comeBack: "Come back tomorrow",
            points: "points",
        }
    }
};

export function useTranslation() {
    const { user } = useGameStore();
    const lang = user?.settings?.language || 'es';

    return {
        t: (key) => {
            const keys = key.split('.');
            let value = translations[lang];
            for (const k of keys) {
                value = value?.[k];
            }
            return value || key;
        },
        lang
    };
}
