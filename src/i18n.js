
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  zhTW: {
    translation: {
      title: "AI 心情陪伴",
      placeholder: "請輸入你的心情...",
      send: "送出"
    }
  },
  en: {
    translation: {
      title: "AI Mood Companion",
      placeholder: "How are you feeling?",
      send: "Send"
    }
  },
  ja: {
    translation: {
      title: "AIムードコンパニオン",
      placeholder: "今の気分は？",
      send: "送信"
    }
  },
  th: {
    translation: {
      title: "เพื่อนคู่ใจ AI",
      placeholder: "คุณรู้สึกอย่างไร?",
      send: "ส่งข้อความ"
    }
  },
  id: {
    translation: {
      title: "Teman Mood AI",
      placeholder: "Apa perasaanmu?",
      send: "Kirim"
    }
  },
  fil: {
    translation: {
      title: "AI Mood Companion",
      placeholder: "Kumusta ang iyong pakiramdam?",
      send: "Ipadala"
    }
  },
  vi: {
    translation: {
      title: "Người bạn đồng hành AI",
      placeholder: "Bạn cảm thấy thế nào?",
      send: "Gửi"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'zhTW',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
