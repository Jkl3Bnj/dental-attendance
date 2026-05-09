from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class TipoRegistro(str, enum.Enum):
    entrada = "entrada"
    salida = "salida"

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    tipo = Column(Enum(TipoRegistro), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    observacion = Column(String, nullable=True)

    doctor = relationship("Doctor", back_populates="attendances")