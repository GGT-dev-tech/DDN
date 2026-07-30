from datetime import date
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, Field
from uuid import UUID

from modules.pricing.domain.value_objects import PricingRuleScope, PricingRuleType

class PriceTableItemCreateRequest(BaseModel):
    service_offering_id: UUID
    unit_of_measure_id: UUID
    amount: Decimal = Field(..., gt=0)
    currency: str = "BRL"

class PriceTableCreateRequest(BaseModel):
    name: str = Field(..., max_length=255)
    effective_date: date
    end_date: Optional[date] = None
    region_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    is_active: bool = False

class PriceTableResponse(BaseModel):
    id: UUID
    name: str
    effective_date: date
    end_date: Optional[date] = None
    region_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    is_active: bool


class PricingRuleCreateRequest(BaseModel):
    name: str = Field(..., max_length=255)
    scope: PricingRuleScope
    rule_type: PricingRuleType
    value: Decimal = Field(..., gt=0)
    priority: int = 0
    customer_id: Optional[UUID] = None
    service_offering_id: Optional[UUID] = None
    region_id: Optional[UUID] = None

class PriceCalculationRequest(BaseModel):
    service_offering_id: UUID
    unit_of_measure_id: UUID
    quantity: Decimal = Field(..., gt=0)
    reference_date: date
    region_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None

class MoneyResponse(BaseModel):
    amount: Decimal
    currency: str

class PriceCalculationResponse(BaseModel):
    service_offering_id: UUID
    unit_of_measure_id: UUID
    quantity: Decimal
    base_unit_price: MoneyResponse
    total_base_price: MoneyResponse
    final_price: MoneyResponse
    applied_rules_ids: List[UUID]
