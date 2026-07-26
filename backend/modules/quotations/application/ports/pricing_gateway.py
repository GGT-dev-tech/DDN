from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Optional, Protocol
from uuid import UUID

from modules.quotations.domain.value_objects import QuotationItemSnapshot


@dataclass
class PricingContext:
    service_offering_id: UUID
    unit_of_measure_id: UUID
    quantity: Decimal
    reference_date: date
    customer_id: Optional[UUID] = None
    region_id: Optional[UUID] = None
    
    # Metadata for snapshot enrichment
    service_name: str = ""
    unit_name: str = ""


class PricingGateway(Protocol):
    """
    Anti-Corruption Layer (ACL) entre Quotation e Pricing.
    Protege Quotation de acoplamento direto com a complexidade interna do Pricing,
    além de traduzir o PriceCalculationResult em um QuotationItemSnapshot.
    """
    
    async def get_price_snapshot(self, context: PricingContext) -> QuotationItemSnapshot:
        ...
