from decimal import Decimal
from uuid import UUID

from modules.core.domain.id_generator import IdGenerator
from modules.pricing.domain.events import PricingRuleCreated
from modules.pricing.domain.value_objects import Money, PricingRuleScope, PricingRuleType
from shared_kernel.contracts.aggregate_root import AggregateRoot


class PricingRule(AggregateRoot):
    def __init__(
        self,
        name: str,
        scope: PricingRuleScope,
        rule_type: PricingRuleType,
        value: Decimal,
        priority: int = 0,
        customer_id: UUID | None = None,
        service_offering_id: UUID | None = None,
        region_id: UUID | None = None,
        id: UUID | None = None,
        is_active: bool = True
    ):
        super().__init__()
        self._id = id or IdGenerator.generate()
        self._version = 1
        self.name = name
        self.scope = scope
        self.rule_type = rule_type
        self.value = value
        self.priority = priority
        self.customer_id = customer_id
        self.service_offering_id = service_offering_id
        self.region_id = region_id
        self.is_active = is_active
        
        self.validate()
        if not id:
            self.add_event(PricingRuleCreated(
                pricing_rule_id=self.id, 
                scope=self.scope.value,
                rule_type=self.rule_type.value
            ))
            
    @property
    def id(self) -> UUID:
        return self._id
        
    @property
    def version(self) -> int:
        return self._version

    def validate(self):
        if self.scope == PricingRuleScope.CUSTOMER and not self.customer_id:
            raise ValueError("customer_id is required for CUSTOMER scope")
        if self.scope == PricingRuleScope.SERVICE and not self.service_offering_id:
            raise ValueError("service_offering_id is required for SERVICE scope")
        if self.scope == PricingRuleScope.REGION and not self.region_id:
            raise ValueError("region_id is required for REGION scope")
            
    def apply(self, base_price: Money) -> Money:
        """Applies the rule directly to a given Money value"""
        if self.rule_type == PricingRuleType.PERCENTAGE_DISCOUNT:
            # value is e.g. 10 for 10%
            discount_amount = base_price.amount * (self.value / Decimal(100))
            return Money(amount=base_price.amount - discount_amount, currency=base_price.currency)
            
        elif self.rule_type == PricingRuleType.ABSOLUTE_DISCOUNT:
            new_amount = base_price.amount - self.value
            return Money(amount=max(Decimal(0), new_amount), currency=base_price.currency)
            
        elif self.rule_type == PricingRuleType.PERCENTAGE_SURCHARGE:
            surcharge_amount = base_price.amount * (self.value / Decimal(100))
            return Money(amount=base_price.amount + surcharge_amount, currency=base_price.currency)
            
        elif self.rule_type == PricingRuleType.ABSOLUTE_SURCHARGE:
            return Money(amount=base_price.amount + self.value, currency=base_price.currency)
            
        return base_price
