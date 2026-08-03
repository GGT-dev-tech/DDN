import asyncio
import os
import sys
import uuid
import json
from datetime import date, datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from uuid6 import uuid7

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/ddn_management"
)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

TENANT_ID = "00000000-0000-0000-0000-000000000001"

async def extend_seed(session: AsyncSession):
    print("🌱 Extendendo seed com dados de Cotações, Contratos, OS e Rotas...\n")

    # 1. Pegar Offering e UOM
    res = await session.execute(text("SELECT id, name, default_uom_id FROM catalog_service_offerings WHERE tenant_id = :tid LIMIT 1"), {"tid": TENANT_ID})
    offering = res.fetchone()
    if not offering:
        print("Nenhum offering encontrado. Rode o seed_demo_data.py primeiro.")
        return
    offering_id, offering_name, uom_id = offering

    # 2. Pegar Veículo e Motorista
    res = await session.execute(text("SELECT id FROM fleet_vehicles WHERE tenant_id = :tid LIMIT 1"), {"tid": TENANT_ID})
    vehicle = res.fetchone()
    vehicle_id = vehicle[0] if vehicle else None

    res = await session.execute(text("SELECT id FROM fleet_drivers WHERE tenant_id = :tid LIMIT 1"), {"tid": TENANT_ID})
    driver = res.fetchone()
    driver_id = driver[0] if driver else None

    # 3. Criar uma Empresa (Company)
    company_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO commercial_companies (id, tenant_id, trade_name, corporate_name, document_number, status, created_at)
        VALUES (:id, :tid, 'Restaurante Sabor & Arte', 'Sabor e Arte LTDA', '12345678000100', 'ACTIVE', NOW())
    """), {"id": company_id, "tid": TENANT_ID})
    
    # Criar Endereço da Empresa (Service Location)
    location_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO commercial_service_locations (id, tenant_id, company_id, address_line, city, state, zip_code, is_main)
        VALUES (:id, :tid, :cid, 'Av. Brasil, 1500', 'São Paulo', 'SP', '01000-000', true)
    """), {"id": location_id, "tid": TENANT_ID, "cid": company_id})

    # 4. Criar Cotação Aprovada
    quotation_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO quotations_quotations (id, tenant_id, company_id, status, created_at, updated_at)
        VALUES (:id, :tid, :cid, 'APPROVED', NOW(), NOW())
    """), {"id": quotation_id, "tid": TENANT_ID, "cid": company_id})

    quotation_item_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO quotations_quotation_items (id, tenant_id, quotation_id, service_offering_id, unit_of_measure_id, quantity)
        VALUES (:id, :tid, :qid, :off_id, :uom_id, 10.0)
    """), {"id": quotation_item_id, "tid": TENANT_ID, "qid": quotation_id, "off_id": offering_id, "uom_id": uom_id})

    await session.execute(text("""
        INSERT INTO quotations_quotation_item_snapshots (id, tenant_id, quotation_item_id, service_name, unit_name, base_unit_price, total_base_price, surcharges_total, discounts_total, final_price, currency, created_at)
        VALUES (:id, :tid, :qitem_id, :s_name, 'Kg', 15.0, 150.0, 0, 0, 150.0, 'BRL', NOW())
    """), {"id": str(uuid7()), "tid": TENANT_ID, "qitem_id": quotation_item_id, "s_name": offering_name})

    # 5. Criar Contrato Ativo
    contract_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO contracts_contracts (id, tenant_id, company_id, quotation_id, status, effective_date, created_at, updated_at)
        VALUES (:id, :tid, :cid, :qid, 'ACTIVE', CURRENT_DATE - 30, NOW(), NOW())
    """), {"id": contract_id, "tid": TENANT_ID, "cid": company_id, "qid": quotation_id})

    version_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO contracts_contract_versions (id, tenant_id, contract_id, version_number, created_at)
        VALUES (:id, :tid, :ctid, 1, NOW())
    """), {"id": version_id, "tid": TENANT_ID, "ctid": contract_id})

    contract_item_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO contracts_contract_items (id, tenant_id, version_id, service_offering_id, unit_of_measure_id, quantity)
        VALUES (:id, :tid, :vid, :off_id, :uom_id, 10.0)
    """), {"id": contract_item_id, "tid": TENANT_ID, "vid": version_id, "off_id": offering_id, "uom_id": uom_id})

    await session.execute(text("""
        INSERT INTO contracts_contract_item_snapshots (id, tenant_id, contract_item_id, service_name, unit_name, base_unit_price, total_base_price, surcharges_total, discounts_total, final_price, currency, created_at)
        VALUES (:id, :tid, :citem_id, :s_name, 'Kg', 15.0, 150.0, 0, 0, 150.0, 'BRL', NOW())
    """), {"id": str(uuid7()), "tid": TENANT_ID, "citem_id": contract_item_id, "s_name": offering_name})

    # 6. Criar Plano de Serviço e Schedule
    plan_id = str(uuid7())
    await session.execute(text("""
        INSERT INTO service_plan_plans (id, tenant_id, company_id, contract_id, effective_date, status, created_at, updated_at)
        VALUES (:id, :tid, :cid, :ctid, CURRENT_DATE - 30, 'ACTIVE', NOW(), NOW())
    """), {"id": plan_id, "tid": TENANT_ID, "cid": company_id, "ctid": contract_id})

    recurrence = json.dumps({"frequency": "WEEKLY", "days_of_week": [1,3,5]})
    await session.execute(text("""
        INSERT INTO service_plan_schedules (id, plan_id, service_offering_id, service_name, quantity_snapshot, status, recurrence)
        VALUES (:id, :pid, :off_id, :s_name, 10.0, 'ACTIVE', :rec)
    """), {"id": str(uuid7()), "pid": plan_id, "off_id": offering_id, "s_name": offering_name, "rec": recurrence})

    # 7. Criar 5 Ordens de Serviço (Uma para cada dia da semana anterior até hoje)
    today = date.today()
    for i in range(5):
        sim_date = today - timedelta(days=4-i)
        so_id = str(uuid7())
        
        # Variar os status para mostrar dinamismo
        status = 'COMPLETED' if i < 3 else ('IN_PROGRESS' if i == 3 else 'PENDING')
        
        await session.execute(text("""
            INSERT INTO logistics_service_orders (id, tenant_id, service_plan_id, company_id, scheduled_date, status, workflow_type, vehicle_id, driver_id, created_at, updated_at)
            VALUES (:id, :tid, :pid, :cid, :sdate, :status, 'WAREHOUSE_STORAGE', :vid, :did, NOW(), NOW())
        """), {"id": so_id, "tid": TENANT_ID, "pid": plan_id, "cid": company_id, "sdate": sim_date, "status": status, "vid": vehicle_id, "did": driver_id})
        
        await session.execute(text("""
            INSERT INTO logistics_service_order_items (id, service_order_id, service_offering_id, quantity, service_name)
            VALUES (:id, :soid, :off_id, '10', :s_name)
        """), {"id": str(uuid7()), "soid": so_id, "off_id": offering_id, "s_name": offering_name})

        # 8. Criar Rota e Parada
        route_id = str(uuid7())
        route_status = 'COMPLETED' if status == 'COMPLETED' else ('IN_PROGRESS' if status == 'IN_PROGRESS' else 'DRAFT')
        await session.execute(text("""
            INSERT INTO routing_routes (id, tenant_id, execution_date, status, vehicle_id, driver_id)
            VALUES (:id, :tid, :edate, :status, :vid, :did)
        """), {"id": route_id, "tid": TENANT_ID, "edate": sim_date, "status": route_status, "vid": vehicle_id, "did": driver_id})

        stop_status = 'COMPLETED' if status == 'COMPLETED' else 'SCHEDULED'
        await session.execute(text("""
            INSERT INTO routing_stops (id, route_id, latitude, longitude, address, "order", status)
            VALUES (:id, :rid, -23.5505, -46.6333, 'Av. Brasil, 1500, São Paulo, SP', 1, :sstatus)
        """), {"id": str(uuid7()), "rid": route_id, "sstatus": "COLLECTED" if stop_status == "COMPLETED" else stop_status})

    await session.commit()
    print("✅ Seed estendido finalizado com sucesso!")


async def main():
    engine = create_async_engine(DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with session_factory() as session:
            await extend_seed(session)
    except Exception as exc:
        print(f"\n❌ Erro durante o seed: {exc}")
        import traceback; traceback.print_exc()
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
