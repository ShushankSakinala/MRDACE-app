from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import MedicalRecord, MedicalImage, User, UserRole
from app.core.auth import verify_password
from app.core.encryption import EncryptionService
import os

router = APIRouter(prefix="/records", tags=["records"])
encryption_service = EncryptionService()

@router.get("/")
def list_records(db: Session = Depends(get_db)):
    # Basic list - will be restricted by RBAC in next iteration
    return db.query(MedicalRecord).all()

@router.post("/upload")
async def upload_record(
    patient_id: int, 
    record_type: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Save and encrypt image
    content = await file.read()
    encrypted_content = encryption_service.encrypt_data(content)
    
    file_name = f"{file.filename}.enc"
    file_path = os.path.join("uploads", file_name)
    
    if not os.path.exists("uploads"):
        os.makedirs("uploads")
    
    with open(file_path, "wb") as f:
        f.write(encrypted_content)
    
    # 2. Create record entries
    new_record = MedicalRecord(patient_id=patient_id, record_type=record_type)
    db.add(new_record)
    db.flush() # Get record ID
    
    new_image = MedicalImage(
        record_id=new_record.id,
        file_path=file_path,
        image_type=file.content_type,
        checksum="sha256_mock" # To be implemented
    )
    db.add(new_image)
    db.commit()
    
    return {"status": "success", "record_id": new_record.id}
