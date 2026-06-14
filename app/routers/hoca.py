from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db

router = APIRouter()

@router.get("/gruplari-olustur/{ders_id}", response_model=schemas.CourseGroupGenerationResponse)
def gruplari_olustur(ders_id: str, db: Session = Depends(get_db)):
    try:
        data = crud.get_course_group_data(db, ders_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"'{ders_id}' kodlu ders bulunamadı."
            )
        return data
    except HTTPException:
        raise
    except Exception:
        # Respecting RULE[error-mesaji.md] by not printing exception to console
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Grup verileri çekilirken bir hata oluştu."
        )

@router.post("/oturumu-sifirla/{ders_id}")
def oturumu_sifirla(ders_id: str, db: Session = Depends(get_db)):
    try:
        deleted_count = crud.reset_course_session(db, ders_id)
        return {"message": f"Oturum sıfırlandı. {deleted_count} anket kaydı silindi.", "ders_id": ders_id}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Oturum sıfırlanırken bir hata oluştu."
        )

@router.delete("/ogrenci/{ogrenci_id}/ders/{ders_id}")
def ogrenciyi_dersten_sil(ogrenci_id: int, ders_id: str, db: Session = Depends(get_db)):
    try:
        success = crud.delete_student_from_course(db, ogrenci_id, ders_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"'{ders_id}' dersinde '{ogrenci_id}' numaralı öğrenci anketi bulunamadı."
            )
        return {"message": "Öğrenci bu dersten başarıyla silindi.", "ogrenci_id": ogrenci_id}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Öğrenci silinirken bir hata oluştu."
        )
