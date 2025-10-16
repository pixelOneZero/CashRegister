from pydantic import BaseModel, Field
from typing import Dict, List
from enum import Enum


class Locale(str, Enum):
    EN_US = "en-US"
    FR_FR = "fr-FR"


class ChangeRequest(BaseModel):
    # Request model for change calculation
    amount_owed: float = Field(..., description="Amount owed by customer", ge=0)
    amount_paid: float = Field(..., description="Amount paid by customer", ge=0)
    locale: Locale = Field(default=Locale.EN_US, description="Locale for currency formatting")
    divisor: int = Field(default=3, description="Divisor for random change generation")

    class Config:
        json_schema_extra = {
            "example": {
                "amount_owed": 2.12,
                "amount_paid": 3.00,
                "locale": "en-US",
                "divisor": 3
            }
        }


class ChangeResponse(BaseModel):
    # Response model for change calculation
    change_amount: float = Field(..., description="Total change amount")
    change_cents: int = Field(..., description="Change amount in cents")
    denominations: Dict[str, int] = Field(..., description="Change denominations")
    formatted_change: str = Field(..., description="Human-readable change string")
    is_random: bool = Field(..., description="Whether random generation was used")
    locale: Locale = Field(..., description="Locale used for formatting")

    class Config:
        json_schema_extra = {
            "example": {
                "change_amount": 0.88,
                "change_cents": 88,
                "denominations": {"quarters": 3, "dime": 1, "pennies": 3},
                "formatted_change": "3 quarters,1 dime,3 pennies",
                "is_random": False,
                "locale": "en-US"
            }
        }


