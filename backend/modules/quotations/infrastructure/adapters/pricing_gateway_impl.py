
from modules.pricing.application.services.pricing_service import PricingService
from modules.quotations.application.ports.pricing_gateway import PricingContext, PricingGateway
from modules.quotations.domain.value_objects import Money, QuotationItemSnapshot


class PricingGatewayImpl(PricingGateway):
    """
    Implementação concreta do ACL entre Quotation e Pricing.
    Depende diretamente do PricingService e faz a tradução.
    """
    
    def __init__(self, pricing_service: PricingService):
        self.pricing_service = pricing_service
        
    async def get_price_snapshot(self, context: PricingContext) -> QuotationItemSnapshot:
        result = await self.pricing_service.calculate_price(
            service_offering_id=context.service_offering_id,
            unit_of_measure_id=context.unit_of_measure_id,
            quantity=context.quantity,
            reference_date=context.reference_date,
            region_id=context.region_id,
            customer_id=context.customer_id,
            price_table_id=context.price_table_id
        )
        
        # Translate the Pricing domain result into Quotation's snapshot VO
        return QuotationItemSnapshot(
            service_name=context.service_name,
            unit_name=context.unit_name,
            base_unit_price=Money(result.base_unit_price.amount, result.base_unit_price.currency),
            total_base_price=Money(result.total_base_price.amount, result.total_base_price.currency),
            surcharges_total=Money(result.surcharges_total.amount, result.surcharges_total.currency),
            discounts_total=Money(result.discounts_total.amount, result.discounts_total.currency),
            final_price=Money(result.final_price.amount, result.final_price.currency),
            pricing_reference=f"Table: {result.applied_table_id} | Rules: {[r for r in result.applied_rule_ids]}"
        )
