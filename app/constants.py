from enum import Enum

class MusaitlikZamani(str, Enum):
    HAFTA_ICI = "Hafta İçi"
    HAFTA_SONU = "Hafta Sonu"
    HER_IKISI = "Her İkisi de"

class IletisimFormati(str, Enum):
    YUZ_YUZE = "Yüz Yüze"
    ONLINE = "Online / Çevrimiçi"
    HIBRIT = "Hibrit"

class HaftalikEforSaati(str, Enum):
    DUSUK = "1-3 Saat"
    ORTA = "4-7 Saat"
    YUKSEK = "8+ Saat"

class CalismaTarzi(str, Enum):
    BIREYSEL_ODAKLI = "Önce bireysel, sonra birleştirme"
    BIRLIKTE_ODAKLI = "Sürekli birlikte çalışarak"
    ESNEK = "Görev dağılımına göre esnek"

class CheckInSikligi(str, Enum):
    HER_GUN = "Her gün kısa durum güncellemesi"
    HAFTADA_BIR = "Haftada bir toplantı"
    IHTIYAC_HALINDE = "Yalnızca ihtiyaç duyulduğunda"

class KararAlmaMekanizmasi(str, Enum):
    OY_BIRLIGI = "Ortak karar / Oy birliği"
    DEMOKRATIK = "Oy çokluğu"
    LIDER_ODAKLI = "Grup liderinin kararı"

class KullanilanAraclar(str, Enum):
    GITHUB_DISCORD = "GitHub ve Discord"
    ZOOM_TRELLO = "Zoom ve Trello"
    GOOGLE_WORKSPACE = "Google Workspace (Drive, Meet)"
    TUMU = "Hepsi ve diğerleri"

# Application Settings Constants
API_PREFIX = "/api"
DATABASE_SQLITE_URL = "sqlite:///./group_finder.db"
DEFAULT_GPA_MIN = 0.0
DEFAULT_GPA_MAX = 4.0
