from datetime import datetime
from sqlalchemy import Table, Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# Many-to-Many Association Table between Takim and Ogrenci
takim_ogrenci = Table(
    "takim_ogrenci",
    Base.metadata,
    Column("takim_id", Integer, ForeignKey("takim.takim_id", ondelete="CASCADE"), primary_key=True),
    Column("ogrenci_id", Integer, ForeignKey("ogrenci.ogrenci_id", ondelete="CASCADE"), primary_key=True)
)

class Egitmen(Base):
    __tablename__ = "egitmen"

    egitmen_id = Column(Integer, primary_key=True, autoincrement=True)
    ad_soyad = Column(String(150), nullable=False)

    # Relationships
    dersler = relationship("Ders", back_populates="egitmen", cascade="all, delete-orphan")


class Ders(Base):
    __tablename__ = "ders"

    ders_id = Column(String(50), primary_key=True)  # Course code like CS302
    ders_adi = Column(String(200), nullable=False)
    donem = Column(String(50), nullable=False)
    egitmen_id = Column(Integer, ForeignKey("egitmen.egitmen_id", ondelete="CASCADE"), nullable=False)

    # Relationships
    egitmen = relationship("Egitmen", back_populates="dersler")
    takimlar = relationship("Takim", back_populates="ders", cascade="all, delete-orphan")
    anketler = relationship("AnketCevaplari", back_populates="ders", cascade="all, delete-orphan")
    arkadas_tercihleri = relationship("ArkadasTercihi", back_populates="ders", cascade="all, delete-orphan")


class Takim(Base):
    __tablename__ = "takim"

    takim_id = Column(Integer, primary_key=True, autoincrement=True)
    ders_id = Column(String(50), ForeignKey("ders.ders_id", ondelete="CASCADE"), nullable=False)
    takim_adi = Column(String(100), nullable=False)
    olusturulma_tarihi = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    ders = relationship("Ders", back_populates="takimlar")
    ogrenciler = relationship("Ogrenci", secondary=takim_ogrenci, back_populates="takimlar")


class Ogrenci(Base):
    __tablename__ = "ogrenci"

    ogrenci_id = Column(Integer, primary_key=True)  # Student number
    ad_soyad = Column(String(150), nullable=False)
    gpa = Column(Float, nullable=False)

    # Relationships
    takimlar = relationship("Takim", secondary=takim_ogrenci, back_populates="ogrenciler")
    anketler = relationship("AnketCevaplari", back_populates="ogrenci", cascade="all, delete-orphan")
    
    # Track preferences (both sent and received)
    tercih_eden = relationship(
        "ArkadasTercihi", 
        foreign_keys="[ArkadasTercihi.talep_eden_id]", 
        back_populates="talep_eden",
        cascade="all, delete-orphan"
    )
    tercih_edilen = relationship(
        "ArkadasTercihi", 
        foreign_keys="[ArkadasTercihi.talep_edilen_id]", 
        back_populates="talep_edilen",
        cascade="all, delete-orphan"
    )


class ArkadasTercihi(Base):
    __tablename__ = "arkadas_tercihi"

    tercih_id = Column(Integer, primary_key=True, autoincrement=True)
    talep_eden_id = Column(Integer, ForeignKey("ogrenci.ogrenci_id", ondelete="CASCADE"), nullable=False)
    talep_edilen_id = Column(Integer, ForeignKey("ogrenci.ogrenci_id", ondelete="CASCADE"), nullable=False)
    ders_id = Column(String(50), ForeignKey("ders.ders_id", ondelete="CASCADE"), nullable=False)

    # Relationships
    talep_eden = relationship("Ogrenci", foreign_keys=[talep_eden_id], back_populates="tercih_eden")
    talep_edilen = relationship("Ogrenci", foreign_keys=[talep_edilen_id], back_populates="tercih_edilen")
    ders = relationship("Ders", back_populates="arkadas_tercihleri")


class AnketCevaplari(Base):
    __tablename__ = "anket_cevaplari"

    cevap_id = Column(Integer, primary_key=True, autoincrement=True)
    ogrenci_id = Column(Integer, ForeignKey("ogrenci.ogrenci_id", ondelete="CASCADE"), nullable=False)
    ders_id = Column(String(50), ForeignKey("ders.ders_id", ondelete="CASCADE"), nullable=False)

    # Survey Responses stored as Strings (validated against Enums via Pydantic)
    musaitlik_zamani = Column(String(100), nullable=False)
    iletisim_formati = Column(String(100), nullable=False)
    haftalik_efor_saati = Column(String(100), nullable=False)
    calisma_tarzi = Column(String(255), nullable=False)
    check_in_sikligi = Column(String(255), nullable=False)
    karar_alma_mekanizmasi = Column(String(255), nullable=False)
    kullanilan_araclar = Column(String(255), nullable=False)

    # Relationships
    ogrenci = relationship("Ogrenci", back_populates="anketler")
    ders = relationship("Ders", back_populates="anketler")
