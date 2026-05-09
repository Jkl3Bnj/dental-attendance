from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    hashed = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        password_hash=hashed,
        rol=user.rol,
        doctor_id=user.doctor_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "id": new_user.id,
        "email": new_user.email,
        "rol": new_user.rol,
        "doctor_id": new_user.doctor_id,
        "mensaje": "Usuario registrado correctamente"
    }

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    if not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_access_token(data={
        "sub": db_user.email,
        "doctor_id": db_user.doctor_id,
        "rol": db_user.rol
    })
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
def get_me(db: Session = Depends(get_db), token: str = Depends(__import__('fastapi').security.OAuth2PasswordBearer(tokenUrl="auth/login"))):
    from app.auth import decode_token
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="No autorizado")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {
        "email": user.email,
        "rol": user.rol,
        "doctor_id": user.doctor_id
    }