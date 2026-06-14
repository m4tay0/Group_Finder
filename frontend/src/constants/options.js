export const MUSAITLIK_OPTIONS = {
  HAFTA_ICI: "Hafta İçi",
  HAFTA_SONU: "Hafta Sonu",
  HER_IKISI: "Her İkisi de"
};

export const ILETISIM_OPTIONS = {
  YUZ_YUZE: "Yüz Yüze",
  ONLINE: "Online / Çevrimiçi",
  HIBRIT: "Hibrit"
};

export const ARAC_OPTIONS = {
  GITHUB_DISCORD: "GitHub ve Discord",
  ZOOM_TRELLO: "Zoom ve Trello",
  GOOGLE_WORKSPACE: "Google Workspace (Drive, Meet)",
  HEPSI: "Hepsi ve diğerleri"
};

export const SURVEY_QUESTIONS = [
  {
    id: "musaitlik_zamani",
    title: "1. Müsaitlik Zamanı",
    type: "multi",
    options: [
      { value: MUSAITLIK_OPTIONS.HAFTA_ICI, label: MUSAITLIK_OPTIONS.HAFTA_ICI },
      { value: MUSAITLIK_OPTIONS.HAFTA_SONU, label: MUSAITLIK_OPTIONS.HAFTA_SONU },
      { value: MUSAITLIK_OPTIONS.HER_IKISI, label: MUSAITLIK_OPTIONS.HER_IKISI }
    ]
  },
  {
    id: "iletisim_formati",
    title: "2. İletişim Formatı",
    type: "multi",
    options: [
      { value: ILETISIM_OPTIONS.YUZ_YUZE, label: ILETISIM_OPTIONS.YUZ_YUZE },
      { value: ILETISIM_OPTIONS.ONLINE, label: ILETISIM_OPTIONS.ONLINE },
      { value: ILETISIM_OPTIONS.HIBRIT, label: ILETISIM_OPTIONS.HIBRIT }
    ]
  },
  {
    id: "haftalik_efor_saati",
    title: "3. Haftalık Efor Saati",
    type: "single",
    options: [
      { value: "1-3 Saat", label: "1-3 Saat" },
      { value: "4-7 Saat", label: "4-7 Saat" },
      { value: "8+ Saat", label: "8+ Saat" }
    ]
  },
  {
    id: "calisma_tarzi",
    title: "4. Çalışma Tarzı",
    type: "single",
    options: [
      { value: "Önce bireysel, sonra birleştirme", label: "Önce bireysel, sonra birleştirme" },
      { value: "Sürekli birlikte çalışarak", label: "Sürekli birlikte çalışarak" },
      { value: "Görev dağılımına göre esnek", label: "Görev dağılımına göre esnek" }
    ]
  },
  {
    id: "check_in_sikligi",
    title: "5. Check-in Sıklığı",
    type: "single",
    options: [
      { value: "Her gün kısa durum güncellemesi", label: "Her gün kısa durum güncellemesi" },
      { value: "Haftada bir toplantı", label: "Haftada bir toplantı" },
      { value: "Yalnızca ihtiyaç duyulduğunda", label: "Yalnızca ihtiyaç duyulduğunda" }
    ]
  },
  {
    id: "karar_alma_mekanizmasi",
    title: "6. Karar Alma Mekanizması",
    type: "single",
    options: [
      { value: "Ortak karar / Oy birliği", label: "Ortak karar / Oy birliği" },
      { value: "Oy çokluğu", label: "Oy çokluğu" },
      { value: "Grup liderinin kararı", label: "Grup liderinin kararı" }
    ]
  },
  {
    id: "kullanilan_araclar",
    title: "7. Kullanılan Araçlar",
    type: "multi",
    options: [
      { value: ARAC_OPTIONS.GITHUB_DISCORD, label: ARAC_OPTIONS.GITHUB_DISCORD },
      { value: ARAC_OPTIONS.ZOOM_TRELLO, label: ARAC_OPTIONS.ZOOM_TRELLO },
      { value: ARAC_OPTIONS.GOOGLE_WORKSPACE, label: ARAC_OPTIONS.GOOGLE_WORKSPACE },
      { value: ARAC_OPTIONS.HEPSI, label: ARAC_OPTIONS.HEPSI }
    ]
  }
];

export const MOCK_COURSE_ID = "BTBS316";
export const MOCK_URL_BASE = "http://localhost:5173/?view=katil&ders_id=";
export const COUNTER_INTERVAL_MS = 4000;
export const GPA_MIN_VALUE = 0.0;
export const GPA_MAX_VALUE = 4.0;
export const SESSION_STORAGE_KEY = 'groupfinder_session';
export const CAPACITY_STORAGE_KEY = 'groupfinder_capacity';
export const SESSION_START_KEY = 'groupfinder_session_start';
export const API_BASE_URL = 'http://localhost:8000/api';
