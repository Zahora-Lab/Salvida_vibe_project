import re
from pydantic import BaseModel, field_validator, model_validator
from typing import Literal, Optional

OBSERVATIONS_MAX_LENGTH = 1000


BookingStatus = Literal["Approved", "Pending", "Completed", "Cancelled", "SignPending"]
ServiceReason = Literal[
    "medical_appointment",
    "physiotherapy",
    "dialysis",
    "hospital_admission",
    "administrative",
    "other",
]


def _clean_observations(v: Optional[str]) -> Optional[str]:
    if v is None:
        return None
    v = v.strip()
    if not v:
        return None
    if len(v) > OBSERVATIONS_MAX_LENGTH:
        raise ValueError(f"observations must be at most {OBSERVATIONS_MAX_LENGTH} characters")
    return v


class BookingBase(BaseModel):
    prmId: str
    startTime: str          # 'HH:MM'
    endTime: str            # 'HH:MM'
    date: str               # 'YYYY-MM-DD'
    address: str = ""
    addressId: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    service_reason: Optional[ServiceReason] = None
    service_reason_notes: Optional[str] = None
    observations: Optional[str] = None

    @field_validator("observations")
    @classmethod
    def validate_observations(cls, v: Optional[str]) -> Optional[str]:
        return _clean_observations(v)

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", v):
            raise ValueError("date must be in YYYY-MM-DD format")
        return v

    @field_validator("startTime", "endTime")
    @classmethod
    def validate_time(cls, v: str) -> str:
        if not re.fullmatch(r"\d{2}:\d{2}", v):
            raise ValueError("time must be in HH:MM format")
        return v

class BookingCreate(BookingBase):
    @model_validator(mode="after")
    def validate_time_range(self) -> "BookingCreate":
        if self.startTime and self.endTime and self.startTime > self.endTime:
            raise ValueError("endTime must be after startTime")
        return self


class BookingUpdate(BaseModel):
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    date: Optional[str] = None
    address: Optional[str] = None
    addressId: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: Optional[BookingStatus] = None
    service_reason: Optional[ServiceReason] = None
    service_reason_notes: Optional[str] = None
    observations: Optional[str] = None

    @field_validator("observations")
    @classmethod
    def validate_observations(cls, v: Optional[str]) -> Optional[str]:
        return _clean_observations(v)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class BookingCancel(BaseModel):
    reason: Optional[str] = None


class Booking(BookingBase):
    id: str
    prmName: str
    prmAvatar: Optional[str] = None
    status: BookingStatus = "Pending"
    is_demo: bool = False
    created_by_admin: bool = False
    owner_name: Optional[str] = None
    signed_at: Optional[str] = None
    signature_url: Optional[str] = None

    model_config = {"from_attributes": True}


class BookingSign(BaseModel):
    signature_image: str  # base64-encoded PNG from canvas, no data-URI prefix
