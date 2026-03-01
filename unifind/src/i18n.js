import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Comprehensive Dictionary Prototype
const resources = {
    en: {
        translation: {
            "Report Lost": "Report Lost",
            "Report Found": "Report Found",
            "Live Feed": "Live Feed",
            "Campus Map": "Campus Map",
            "Claims": "Claims",
            "Rewards": "Rewards",
            "Top Finders": "Top Finders",
            "Admin": "Admin",
            "Logout": "Logout",
            "Login": "Login"
        }
    },
    es: {
        translation: {
            "Report Lost": "Reportar Perdido",
            "Report Found": "Reportar Encontrado",
            "Live Feed": "Alimentación",
            "Campus Map": "Mapa del Campus",
            "Claims": "Reclamaciones",
            "Rewards": "Recompensas",
            "Top Finders": "Principales",
            "Admin": "Administrador",
            "Logout": "Cerrar sesión",
            "Login": "Acceso"
        }
    },
    zh: {
        translation: {
            "Report Lost": "报告丢失",
            "Report Found": "报告发现",
            "Live Feed": "动态消息",
            "Campus Map": "校园地图",
            "Claims": "索赔",
            "Rewards": "奖励",
            "Top Finders": "最高发现者",
            "Admin": "管理员",
            "Logout": "登出",
            "Login": "登录"
        }
    },
    hi: {
        translation: {
            "Report Lost": "खोया हुआ रिपोर्ट करें",
            "Report Found": "पाया हुआ रिपोर्ट करें",
            "Live Feed": "लाइव फीड",
            "Campus Map": "कैंपस मैप",
            "Claims": "दावे",
            "Rewards": "पुरस्कार",
            "Top Finders": "शीर्ष खोजकर्ता",
            "Admin": "एडमिन",
            "Logout": "लॉग आउट",
            "Login": "लॉग इन"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('unifind_lang') || 'en',
        fallbackLng: "en",
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
