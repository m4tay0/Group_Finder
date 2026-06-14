from sqlalchemy.orm import Session
from app import models, schemas

def get_course(db: Session, ders_id: str):
    return db.query(models.Ders).filter(models.Ders.ders_id == ders_id).first()

def ensure_default_instructor_and_course(db: Session, ders_id: str):
    """
    Ensures that a default instructor and course exist in the database.
    This avoids foreign key violation issues during initial MVP testing.
    """
    course = db.query(models.Ders).filter(models.Ders.ders_id == ders_id).first()
    if not course:
        # Check if we have at least one instructor
        instructor = db.query(models.Egitmen).first()
        if not instructor:
            instructor = models.Egitmen(ad_soyad="NAZİFE DİMİLİLER")
            db.add(instructor)
            db.commit()
            db.refresh(instructor)
        
        course = models.Ders(
            ders_id=ders_id,
            ders_adi=f"Proje Dersi ({ders_id})",
            donem="2026-Bahar",
            egitmen_id=instructor.egitmen_id
        )
        db.add(course)
        db.commit()
        db.refresh(course)
    return course

def save_survey_responses(db: Session, payload: schemas.AnketKaydetRequest):
    # 1. Ensure the course exists (MVP fallback auto-seeding)
    ensure_default_instructor_and_course(db, payload.ders_id)

    # 2. Check and upsert Student
    student = db.query(models.Ogrenci).filter(models.Ogrenci.ogrenci_id == payload.ogrenci_id).first()
    if student:
        student.ad_soyad = payload.ad_soyad
        student.gpa = payload.gpa
    else:
        student = models.Ogrenci(
            ogrenci_id=payload.ogrenci_id,
            ad_soyad=payload.ad_soyad,
            gpa=payload.gpa
        )
        db.add(student)
    
    db.flush()  # Push student changes to DB to allow relations

    # 3. Handle Friend Preference
    # Remove existing preference for this student and course
    db.query(models.ArkadasTercihi).filter(
        models.ArkadasTercihi.talep_eden_id == payload.ogrenci_id,
        models.ArkadasTercihi.ders_id == payload.ders_id
    ).delete()

    if payload.istenen_arkadas_id is not None:
        # Ensure the preferred friend student exists to satisfy foreign keys
        friend = db.query(models.Ogrenci).filter(models.Ogrenci.ogrenci_id == payload.istenen_arkadas_id).first()
        if not friend:
            friend = models.Ogrenci(
                ogrenci_id=payload.istenen_arkadas_id,
                ad_soyad="Beklenen Öğrenci (Tercih)",
                gpa=0.0
            )
            db.add(friend)
            db.flush()

        pref = models.ArkadasTercihi(
            talep_eden_id=payload.ogrenci_id,
            talep_edilen_id=payload.istenen_arkadas_id,
            ders_id=payload.ders_id
        )
        db.add(pref)

    # 4. Handle Survey Answers
    survey = db.query(models.AnketCevaplari).filter(
        models.AnketCevaplari.ogrenci_id == payload.ogrenci_id,
        models.AnketCevaplari.ders_id == payload.ders_id
    ).first()

    if survey:
        survey.musaitlik_zamani = payload.anket.musaitlik_zamani.value
        survey.iletisim_formati = payload.anket.iletisim_formati.value
        survey.haftalik_efor_saati = payload.anket.haftalik_efor_saati.value
        survey.calisma_tarzi = payload.anket.calisma_tarzi.value
        survey.check_in_sikligi = payload.anket.check_in_sikligi.value
        survey.karar_alma_mekanizmasi = payload.anket.karar_alma_mekanizmasi.value
        survey.kullanilan_araclar = payload.anket.kullanilan_araclar.value
    else:
        survey = models.AnketCevaplari(
            ogrenci_id=payload.ogrenci_id,
            ders_id=payload.ders_id,
            musaitlik_zamani=payload.anket.musaitlik_zamani.value,
            iletisim_formati=payload.anket.iletisim_formati.value,
            haftalik_efor_saati=payload.anket.haftalik_efor_saati.value,
            calisma_tarzi=payload.anket.calisma_tarzi.value,
            check_in_sikligi=payload.anket.check_in_sikligi.value,
            karar_alma_mekanizmasi=payload.anket.karar_alma_mekanizmasi.value,
            kullanilan_araclar=payload.anket.kullanilan_araclar.value
        )
        db.add(survey)

    db.commit()
    db.refresh(student)
    db.refresh(survey)
    return student

def get_course_group_data(db: Session, ders_id: str):
    ensure_default_instructor_and_course(db, ders_id)
    course = db.query(models.Ders).filter(models.Ders.ders_id == ders_id).first()
    if not course:
        return None

    surveys = db.query(models.AnketCevaplari).filter(models.AnketCevaplari.ders_id == ders_id).all()
    
    ogrenciler_data = []
    for survey in surveys:
        student = survey.ogrenci
        
        # Look up if this student has a friend preference in this course
        pref = db.query(models.ArkadasTercihi).filter(
            models.ArkadasTercihi.talep_eden_id == student.ogrenci_id,
            models.ArkadasTercihi.ders_id == ders_id
        ).first()

        ogrenciler_data.append({
            "ogrenci_id": student.ogrenci_id,
            "ad_soyad": student.ad_soyad,
            "gpa": student.gpa,
            "anket": {
                "musaitlik_zamani": survey.musaitlik_zamani,
                "iletisim_formati": survey.iletisim_formati,
                "haftalik_efor_saati": survey.haftalik_efor_saati,
                "calisma_tarzi": survey.calisma_tarzi,
                "check_in_sikligi": survey.check_in_sikligi,
                "karar_alma_mekanizmasi": survey.karar_alma_mekanizmasi,
                "kullanilan_araclar": survey.kullanilan_araclar
            },
            "istenen_arkadas_id": pref.talep_edilen_id if pref else None
        })

    return {
        "ders_id": course.ders_id,
        "ders_adi": course.ders_adi,
        "donem": course.donem,
        "ogrenciler": ogrenciler_data
    }

def reset_course_session(db: Session, ders_id: str) -> int:
    """
    Clears all AnketCevaplari and ArkadasTercihi records for a given course.
    Students themselves are NOT deleted — only their survey/preference data for this course.
    Returns the number of deleted survey records.
    """
    deleted_prefs = db.query(models.ArkadasTercihi).filter(
        models.ArkadasTercihi.ders_id == ders_id
    ).delete(synchronize_session=False)

    deleted_surveys = db.query(models.AnketCevaplari).filter(
        models.AnketCevaplari.ders_id == ders_id
    ).delete(synchronize_session=False)

    db.commit()
    return deleted_surveys

def delete_student_from_course(db: Session, ogrenci_id: int, ders_id: str) -> bool:
    """
    Removes a single student's survey and preference data from a specific course.
    The student record itself is NOT deleted.
    Returns True if the survey was found and deleted, False otherwise.
    """
    survey = db.query(models.AnketCevaplari).filter(
        models.AnketCevaplari.ogrenci_id == ogrenci_id,
        models.AnketCevaplari.ders_id == ders_id
    ).first()

    if not survey:
        return False

    # Remove any friend preferences involving this student in this course
    db.query(models.ArkadasTercihi).filter(
        models.ArkadasTercihi.ders_id == ders_id,
        (models.ArkadasTercihi.talep_eden_id == ogrenci_id) |
        (models.ArkadasTercihi.talep_edilen_id == ogrenci_id)
    ).delete(synchronize_session=False)

    db.delete(survey)
    db.commit()
    return True
