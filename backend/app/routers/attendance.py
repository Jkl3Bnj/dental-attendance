from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.attendance import Attendance
from app.models.doctor import Doctor
from app.schemas.attendance import AttendanceCreate, AttendanceResponse
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/attendance", tags=["Asistencia"])

@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def register_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    doctor_id = current_user.get("doctor_id")
    if not doctor_id:
        raise HTTPException(status_code=400, detail="Usuario no tiene doctor asignado")
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor no encontrado")
    new_attendance = Attendance(
        doctor_id=doctor_id,
        tipo=attendance.tipo,
        observacion=attendance.observacion
    )
    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    return new_attendance

@router.get("/", response_model=List[AttendanceResponse])
def get_attendance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Attendance).order_by(Attendance.timestamp.desc()).all()

@router.get("/doctor/{doctor_id}", response_model=List[AttendanceResponse])
def get_doctor_attendance(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Attendance).filter(
        Attendance.doctor_id == doctor_id
    ).order_by(Attendance.timestamp.desc()).all()