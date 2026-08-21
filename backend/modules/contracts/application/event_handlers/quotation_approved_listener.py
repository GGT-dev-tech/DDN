import json
from datetime import UTC, datetime

from modules.contracts.application.services.contract_service import ContractService


class QuotationApprovedListener:
    def __init__(self, contract_service: ContractService):
        self.contract_service = contract_service
        
    async def handle(self, event_payload: str) -> None:
        """
        Handles the QuotationApprovedIntegrationEvent payload string.
        """
        data = json.loads(event_payload)
        
        # In a real system, the event type check would happen in a router/bus.
        if data.get("event_type") != "QuotationApprovedIntegrationEvent":
            return
            
        payload = data["payload"]
        tenant_id_str = payload["tenant_id"]
        company_id_str = payload["company_id"]
        quotation_id_str = payload["quotation_id"]
        items = payload["items"]
        mtr_id_str = payload.get("mtr_id")
        destination_id_str = payload.get("destination_id")
        
        import uuid
        tenant_id = uuid.UUID(tenant_id_str)
        company_id = uuid.UUID(company_id_str)
        quotation_id = uuid.UUID(quotation_id_str)
        mtr_id = uuid.UUID(mtr_id_str) if mtr_id_str else None
        destination_id = uuid.UUID(destination_id_str) if destination_id_str else None
        
        # Transform the snapshot format. Money is expected as Money object in Contract Service creation.
        # But wait, ContractItemSnapshot Money needs to be mapped.
        # Let's map it.
        mapped_items = []
        for item in items:
            snapshot_dict = item["snapshot"]
            from modules.contracts.domain.value_objects import Money as ContractMoney
            
            # Map Money strings/dicts to ContractMoney
            base_price = ContractMoney(amount=snapshot_dict["base_unit_price"]["amount"], currency=snapshot_dict["base_unit_price"]["currency"])
            total_base = ContractMoney(amount=snapshot_dict["total_base_price"]["amount"], currency=snapshot_dict["total_base_price"]["currency"])
            surcharges = ContractMoney(amount=snapshot_dict["surcharges_total"]["amount"], currency=snapshot_dict["surcharges_total"]["currency"])
            discounts = ContractMoney(amount=snapshot_dict["discounts_total"]["amount"], currency=snapshot_dict["discounts_total"]["currency"])
            final = ContractMoney(amount=snapshot_dict["final_price"]["amount"], currency=snapshot_dict["final_price"]["currency"])
            
            mapped_items.append({
                "service_offering_id": uuid.UUID(item["service_offering_id"]),
                "unit_of_measure_id": uuid.UUID(item["unit_of_measure_id"]),
                "quantity": item["quantity"],
                "snapshot": {
                    "service_name": snapshot_dict["service_name"],
                    "unit_name": snapshot_dict["unit_name"],
                    "base_unit_price": base_price,
                    "total_base_price": total_base,
                    "surcharges_total": surcharges,
                    "discounts_total": discounts,
                    "final_price": final,
                    "pricing_reference": snapshot_dict.get("pricing_reference")
                }
            })
            
        # Create contract effective from today.
        await self.contract_service.create_contract(
            tenant_id=tenant_id,
            company_id=company_id,
            quotation_id=quotation_id,
            items_payload=mapped_items,
            effective_date=datetime.now(UTC).date(),
            mtr_id=mtr_id,
            destination_id=destination_id
        )
