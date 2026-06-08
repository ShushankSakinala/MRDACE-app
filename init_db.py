from app.database import SessionLocal, engine
from app.models.models import Base, User, UserRole
from app.core.auth import get_password_hash

def init():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Create default admin if not exists
    admin = db.query(User).filter(User.username == "admin").first()
    if not admin:
        admin = User(
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role=UserRole.ADMIN
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin / admin123")
    else:
        print("Admin user already exists.")
    db.close()

if __name__ == "__main__":
    init()
