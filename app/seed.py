from sqlalchemy.orm import Session
from app import models
from app.constants import (
    MusaitlikZamani,
    IletisimFormati,
    HaftalikEforSaati,
    CalismaTarzi,
    CheckInSikligi,
    KararAlmaMekanizmasi,
    KullanilanAraclar
)

def seed_db(db: Session):
    # Check if data already exists to prevent duplicate seeding
    if db.query(models.Egitmen).first() is not None:
        return

    # 1. Seed Instructors
    jane = models.Egitmen(ad_soyad="NAZİFE DİMİLİLER")
    john = models.Egitmen(ad_soyad="Dr. John Smith")
    db.add_all([jane, john])
    db.commit()
    db.refresh(jane)
    db.refresh(john)

    # 2. Seed Courses
    comp401 = models.Ders(
        ders_id="BTBS316",
        ders_adi="Yazılım Mühendisliği (Software Engineering)",
        donem="2026-Bahar",
        egitmen_id=jane.egitmen_id
    )
    comp302 = models.Ders(
        ders_id="COMP302",
        ders_adi="Veritabanı Yönetim Sistemleri (Database Systems)",
        donem="2026-Bahar",
        egitmen_id=john.egitmen_id
    )
    db.add_all([comp401, comp302])
    db.commit()

    # 3. Seed Students
    students = [
        models.Ogrenci(ogrenci_id=220101001, ad_soyad="Alice Smith", gpa=3.85),
        models.Ogrenci(ogrenci_id=220101002, ad_soyad="Bob Jones", gpa=3.21),
        models.Ogrenci(ogrenci_id=220101003, ad_soyad="Charlie Brown", gpa=2.95),
        models.Ogrenci(ogrenci_id=220101004, ad_soyad="Diana Prince", gpa=3.70),
        models.Ogrenci(ogrenci_id=220101005, ad_soyad="Ethan Hunt", gpa=3.40),
    ]
    db.add_all(students)
    db.commit()

    # 4. Seed Survey Answers for BTBS316
    surveys = [
        models.AnketCevaplari(
            ogrenci_id=220101001,
            ders_id="BTBS316",
            musaitlik_zamani=MusaitlikZamani.HAFTA_ICI.value,
            iletisim_formati=IletisimFormati.ONLINE.value,
            haftalik_efor_saati=HaftalikEforSaati.YUKSEK.value,
            calisma_tarzi=CalismaTarzi.BIRLIKTE_ODAKLI.value,
            check_in_sikligi=CheckInSikligi.HER_GUN.value,
            karar_alma_mekanizmasi=KararAlmaMekanizmasi.OY_BIRLIGI.value,
            kullanilan_araclar=KullanilanAraclar.GITHUB_DISCORD.value
        ),
        models.AnketCevaplari(
            ogrenci_id=220101002,
            ders_id="BTBS316",
            musaitlik_zamani=MusaitlikZamani.HAFTA_SONU.value,
            iletisim_formati=IletisimFormati.HIBRIT.value,
            haftalik_efor_saati=HaftalikEforSaati.ORTA.value,
            calisma_tarzi=CalismaTarzi.ESNEK.value,
            check_in_sikligi=CheckInSikligi.HAFTADA_BIR.value,
            karar_alma_mekanizmasi=KararAlmaMekanizmasi.DEMOKRATIK.value,
            kullanilan_araclar=KullanilanAraclar.ZOOM_TRELLO.value
        ),
        models.AnketCevaplari(
            ogrenci_id=220101003,
            ders_id="BTBS316",
            musaitlik_zamani=MusaitlikZamani.HAFTA_ICI.value,
            iletisim_formati=IletisimFormati.ONLINE.value,
            haftalik_efor_saati=HaftalikEforSaati.ORTA.value,
            calisma_tarzi=CalismaTarzi.BIREYSEL_ODAKLI.value,
            check_in_sikligi=CheckInSikligi.HAFTADA_BIR.value,
            karar_alma_mekanizmasi=KararAlmaMekanizmasi.DEMOKRATIK.value,
            kullanilan_araclar=KullanilanAraclar.GOOGLE_WORKSPACE.value
        ),
        models.AnketCevaplari(
            ogrenci_id=220101004,
            ders_id="BTBS316",
            musaitlik_zamani=MusaitlikZamani.HAFTA_ICI.value,
            iletisim_formati=IletisimFormati.YUZ_YUZE.value,
            haftalik_efor_saati=HaftalikEforSaati.ORTA.value,
            calisma_tarzi=CalismaTarzi.BIRLIKTE_ODAKLI.value,
            check_in_sikligi=CheckInSikligi.HER_GUN.value,
            karar_alma_mekanizmasi=KararAlmaMekanizmasi.OY_BIRLIGI.value,
            kullanilan_araclar=KullanilanAraclar.GITHUB_DISCORD.value
        ),
        models.AnketCevaplari(
            ogrenci_id=220101005,
            ders_id="BTBS316",
            musaitlik_zamani=MusaitlikZamani.HER_IKISI.value,
            iletisim_formati=IletisimFormati.ONLINE.value,
            haftalik_efor_saati=HaftalikEforSaati.DUSUK.value,
            calisma_tarzi=CalismaTarzi.ESNEK.value,
            check_in_sikligi=CheckInSikligi.IHTIYAC_HALINDE.value,
            karar_alma_mekanizmasi=KararAlmaMekanizmasi.LIDER_ODAKLI.value,
            kullanilan_araclar=KullanilanAraclar.ZOOM_TRELLO.value
        ),
    ]
    db.add_all(surveys)
    db.commit()

    # 5. Seed Friend Preferences for BTBS316
    preferences = [
        models.ArkadasTercihi(talep_eden_id=220101001, talep_edilen_id=220101002, ders_id="BTBS316"),
        models.ArkadasTercihi(talep_eden_id=220101002, talep_edilen_id=220101001, ders_id="BTBS316"),
        models.ArkadasTercihi(talep_eden_id=220101003, talep_edilen_id=220101004, ders_id="BTBS316"),
        models.ArkadasTercihi(talep_eden_id=220101004, talep_edilen_id=220101003, ders_id="BTBS316"),
    ]
    db.add_all(preferences)
    db.commit()
