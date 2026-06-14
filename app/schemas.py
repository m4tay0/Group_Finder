from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.constants import (
    DEFAULT_GPA_MIN,
    DEFAULT_GPA_MAX,
    MusaitlikZamani,
    IletisimFormati,
    HaftalikEforSaati,
    CalismaTarzi,
    CheckInSikligi,
    KararAlmaMekanizmasi,
    KullanilanAraclar
)

# ----------------- Survey Questions Schema -----------------
class AnketCevaplariBase(BaseModel):
    musaitlik_zamani: MusaitlikZamani = Field(..., description="Müsaitlik zamanı tercihi")
    iletisim_formati: IletisimFormati = Field(..., description="İletişim kanalı tercihi")
    haftalik_efor_saati: HaftalikEforSaati = Field(..., description="Haftalık ayrılabilecek efor")
    calisma_tarzi: CalismaTarzi = Field(..., description="Grup içi çalışma biçimi")
    check_in_sikligi: CheckInSikligi = Field(..., description="Durum güncelleme sıklığı")
    karar_alma_mekanizmasi: KararAlmaMekanizmasi = Field(..., description="Karar alma yöntemi")
    kullanilan_araclar: KullanilanAraclar = Field(..., description="Grup içi kullanılan ana araçlar")

class AnketCevaplariResponse(AnketCevaplariBase):
    cevap_id: int
    ogrenci_id: int
    ders_id: str

    class Config:
        from_attributes = True


# ----------------- Student & Survey Submission Schema -----------------
class AnketKaydetRequest(BaseModel):
    ogrenci_id: int = Field(..., description="Öğrenci Numarası")
    ad_soyad: str = Field(..., min_length=2, max_length=150, description="Ad Soyad")
    gpa: float = Field(..., description="Genel Akademik Ortalama (GPA)")
    ders_id: str = Field(..., description="Anketin doldurulduğu ders kodu")
    istenen_arkadas_id: Optional[int] = Field(None, description="Birlikte çalışmak istediği arkadaşının öğrenci numarası")
    anket: AnketCevaplariBase = Field(..., description="7 Soruluk anket cevapları")

    @field_validator("gpa")
    @classmethod
    def validate_gpa(cls, v: float) -> float:
        if not (DEFAULT_GPA_MIN <= v <= DEFAULT_GPA_MAX):
            raise ValueError(f"GPA {DEFAULT_GPA_MIN} ile {DEFAULT_GPA_MAX} arasında olmalıdır.")
        return v

    @field_validator("istenen_arkadas_id")
    @classmethod
    def validate_friend_id(cls, v: Optional[int], info) -> Optional[int]:
        # A student cannot request themselves as a friend
        current_student_id = info.data.get("ogrenci_id")
        if v is not None and current_student_id is not None and v == current_student_id:
            raise ValueError("Kendinizi arkadaş tercihi olarak seçemezsiniz.")
        return v


# ----------------- Response Serialization Schemas -----------------
class StudentBriefResponse(BaseModel):
    ogrenci_id: int
    ad_soyad: str
    gpa: float

    class Config:
        from_attributes = True

class StudentDetailedGroupData(BaseModel):
    ogrenci_id: int
    ad_soyad: str
    gpa: float
    anket: AnketCevaplariBase
    istenen_arkadas_id: Optional[int] = None

    class Config:
        from_attributes = True

class CourseGroupGenerationResponse(BaseModel):
    ders_id: str
    ders_adi: str
    donem: str
    ogrenciler: List[StudentDetailedGroupData]

    class Config:
        from_attributes = True
