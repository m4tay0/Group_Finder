from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, crud
from app.database import get_db

router = APIRouter()

@router.post("/anket-kaydet", status_code=status.HTTP_201_CREATED)
def anket_kaydet(payload: schemas.AnketKaydetRequest, db: Session = Depends(get_db)):
    try:
        crud.save_survey_responses(db, payload)
        return {"status": "success", "message": "Anket başarıyla kaydedildi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception:
        # Respecting RULE[error-mesaji.md] by not printing exception to console
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Anket kaydedilirken bir hata oluştu."
        )
