from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.attendance import TipoRegistro

class AttendanceCreate(BaseModel):
    tipo: TipoRegistro
    observacion: Optional[str] = None

class AttendanceResponse(BaseModel):
    id: int
    doctor_id: int
    tipo: TipoRegistro
    timestamp: datetime
    observacion: Optional[str] = None

    class Config:
        from_attributes = True