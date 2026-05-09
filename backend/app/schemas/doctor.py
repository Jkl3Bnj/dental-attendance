from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class DoctorBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    especialidad: str
    telefono: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: int
    activo: bool
    created_at: datetime

    class Config:
        from_attributes = True