from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, LargeBinary, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum
from datetime import datetime

Base = declarative_base()

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    LAB_TECH = "lab_tech"
    PATIENT = "patient"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.PATIENT)
    is_active = Column(Integer, default=1)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    medical_id = Column(String, unique=True, index=True) # Encrypted search field or surrogate
    date_of_birth = Column(String) # Encrypted
    gender = Column(String) # Encrypted
    
    records = relationship("MedicalRecord", back_populates="patient")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    record_type = Column(String) # e.g., "MRI Report", "Blood Test"
    encrypted_data = Column(LargeBinary) # Encrypted JSON or text
    created_at = Column(DateTime, default=datetime.utcnow)

    images = relationship("MedicalImage", back_populates="record")
    patient = relationship("Patient", back_populates="records")

class MedicalImage(Base):
    __tablename__ = "medical_images"

    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("medical_records.id"))
    file_path = Column(String) # Path to encrypted file
    image_type = Column(String) # e.g., "DICOM", "JPEG"
    checksum = Column(String) # SHA-256 for integrity
    metadata_json = Column(LargeBinary) # Encrypted metadata
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    record = relationship("MedicalRecord", back_populates="images")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # e.g., "VIEW", "UPLOAD", "LOGIN"
    resource_id = Column(String) # ID of the record/image accessed
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String)
