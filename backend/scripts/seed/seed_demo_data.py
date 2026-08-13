"""
Seed script para popular o banco de dados com dados de demonstração.
Cria: usuário admin, tenant, veículos, motoristas, clientes (leads e companies), 
      catálogo de serviços, precificação, cotações, contratos, 
      planos de serviços, ordens de serviço e faturas.

Como usar:
    cd /caminho/para/ddn_management/backend
    python scripts/seed/seed_demo_data.py
"""
import asyncio
import os
import sys

# Adiciona o backend ao path para imports funcionarem
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import bcrypt
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from uuid6 import uuid7

# ---------------------------------------------------------------------------
# Configuração do banco
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/ddn_management"
)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

TENANT_ID = "00000000-0000-0000-0000-000000000001"
USER_ID   = "00000000-0000-0000-0000-000000000002"
COMPANY_1_ID = "00000000-0000-0000-0001-000000000001"
COMPANY_2_ID = "00000000-0000-0000-0001-000000000002"

def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")

async def seed(session: AsyncSession):
    print("🌱 Iniciando seed de dados de demonstração (Full Modules)...\n")

    # 1. Tenant
    r = await session.execute(text("SELECT id FROM tenants WHERE id = :id"), {"id": TENANT_ID})
    if not r.fetchone():
        await session.execute(text("""
            INSERT INTO tenants (id, name, legal_name, document_number, status, plan, created_at, updated_at)
            VALUES (:id, :name, :legal_name, :document_number, 'ACTIVE', 'PRO', NOW(), NOW())
        """), {
            "id": TENANT_ID,
            "name": "DDN Gestão Ambiental",
            "legal_name": "DDN Gestão Ambiental Ltda.",
            "document_number": "12345678000199"
        })
        print("  ✅ Tenant criado")

    # 2. Usuário admin
    r = await session.execute(text("SELECT id FROM users WHERE id = :id"), {"id": USER_ID})
    if not r.fetchone():
        pw_hash = hash_password("stitchadmin")
        await session.execute(text("""
            INSERT INTO users (id, email, password_hash, status, created_at, updated_at, email_verified_at)
            VALUES (:id, :email, :password_hash, 'ACTIVE', NOW(), NOW(), NOW())
        """), {"id": USER_ID, "email": "admin@stitch.com", "password_hash": pw_hash})
        print("  ✅ Usuário admin criado")

    # 3. TenantUser
    r = await session.execute(
        text("SELECT id FROM tenant_users WHERE user_id = :uid AND tenant_id = :tid"),
        {"uid": USER_ID, "tid": TENANT_ID}
    )
    if not r.fetchone():
        await session.execute(text("""
            INSERT INTO tenant_users (id, user_id, tenant_id, role, created_at)
            VALUES (:id, :user_id, :tenant_id, 'ADMIN', NOW())
        """), {"id": str(uuid7()), "user_id": USER_ID, "tenant_id": TENANT_ID})
        print("  ✅ TenantUser vinculado")

    await session.commit()

    # 4. Veículos
    r = await session.execute(text("SELECT COUNT(*) FROM fleet_vehicles WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    if r.scalar() == 0:
        vehicles = [
            ("ABC1234", "COMPACTOR_TRUCK", 15.0, 10.0, "ACTIVE"),
            ("DEF5678", "COMPACTOR_TRUCK", 12.0,  8.0, "ACTIVE"),
        ]
        for plate, vtype, vol, wgt, status in vehicles:
            await session.execute(text("""
                INSERT INTO fleet_vehicles (id, tenant_id, license_plate, vehicle_type, capacity_volume, capacity_weight, status)
                VALUES (:id, :tenant_id, :plate, CAST(:vtype AS vehicletype), :vol, :wgt, CAST(:status AS vehiclestatus))
            """), {
                "id": str(uuid7()), "tenant_id": TENANT_ID,
                "plate": plate, "vtype": vtype, "vol": vol, "wgt": wgt, "status": status
            })
        await session.commit()
        print("  ✅ Veículos criados")

    # 5. Motoristas
    r = await session.execute(text("SELECT COUNT(*) FROM fleet_drivers WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    if r.scalar() == 0:
        drivers = [
            ("Carlos Eduardo Silva",  "12345678901", "AVAILABLE"),
            ("Marcos Antônio Santos", "23456789012", "AVAILABLE"),
        ]
        for name, lic, status in drivers:
            await session.execute(text("""
                INSERT INTO fleet_drivers (id, tenant_id, name, license_number, status)
                VALUES (:id, :tenant_id, :name, :lic, CAST(:status AS driverstatus))
            """), {
                "id": str(uuid7()), "tenant_id": TENANT_ID,
                "name": name, "lic": lic, "status": status
            })
        await session.commit()
        print("  ✅ Motoristas criados")

    # 6. Commercial Leads & Companies
    r = await session.execute(text("SELECT COUNT(*) FROM commercial_companies WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    if r.scalar() == 0:
        companies = [
            (COMPANY_1_ID, "Supermercados Bom Preço", "Ana Paula", "ana@bomprecao.com.br", "CUSTOMER"),
            (COMPANY_2_ID, "Hospital São Lucas", "Dr. Paulo", "paulo@saolucas.com.br", "CUSTOMER"),
        ]
        for cid, company, contact, email, status in companies:
            await session.execute(text("""
                INSERT INTO commercial_companies
                  (id, tenant_id, trade_name, corporate_name, document_number, status, created_at)
                VALUES
                  (:id, :tid, :company, :company, :doc, :status, NOW())
            """), {
                "id": cid, "tid": TENANT_ID, "company": company, "doc": f"111222333{cid[:4]}", "status": status
            })
        await session.commit()
        print("  ✅ Clientes (Companies) criados")

    # 7. Catálogo — UOMs
    r = await session.execute(text("SELECT symbol, id FROM catalog_units_of_measure WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    uom_records = r.fetchall()
    uom_ids = {row[0]: str(row[1]) for row in uom_records}
    if not uom_ids:
        uoms = [
            ("Tonelada", "t", "WEIGHT"),
            ("Coleta", "col", "UNIT")
        ]
        for name, symbol, base_type in uoms:
            uid = str(uuid7())
            uom_ids[symbol] = uid
            await session.execute(text("""
                INSERT INTO catalog_units_of_measure (id, tenant_id, symbol, name, base_type, created_at, updated_at)
                VALUES (:id, :tid, :symbol, :name, :base_type, NOW(), NOW())
            """), {
                "id": uid, "tid": TENANT_ID, "symbol": symbol, "name": name, "base_type": base_type
            })
        await session.commit()
        print("  ✅ UOMs criadas")

    # 8. Catálogo — Service Offerings
    r = await session.execute(text("SELECT id, name FROM catalog_service_offerings WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    offerings_records = r.fetchall()
    offering_ids = {row[1]: str(row[0]) for row in offerings_records}
    if not offering_ids:
        default_uom = uom_ids.get("t") or next(iter(uom_ids.values()))
        offerings = [
            ("Coleta de RSU", "Coleta domiciliar e comercial", "WASTE_COLLECTION"),
            ("Coleta de RSS", "Coleta Hospitalar", "WASTE_COLLECTION"),
        ]
        for name, desc, category in offerings:
            uid = str(uuid7())
            offering_ids[name] = uid
            await session.execute(text("""
                INSERT INTO catalog_service_offerings
                  (id, tenant_id, name, description, category, status, default_uom_id, effective_date, created_at, updated_at)
                VALUES
                  (:id, :tid, :name, :desc, :category, 'ACTIVE', :uom_id, CURRENT_DATE, NOW(), NOW())
            """), {
                "id": uid, "tid": TENANT_ID, "name": name, "desc": desc, "category": category, "uom_id": default_uom
            })
        await session.commit()
        print("  ✅ Serviços do catálogo criados")

    # 9. Pricing Tables
    r = await session.execute(text("SELECT id FROM pricing_price_tables WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    row = r.fetchone()
    pricing_table_id = None
    if not row:
        pricing_table_id = str(uuid7())
        await session.execute(text("""
            INSERT INTO pricing_price_tables (id, tenant_id, name, is_active, effective_date, end_date)
            VALUES (:id, :tid, 'Tabela Base 2026', True, CURRENT_DATE, CURRENT_DATE + interval '1 year')
        """), {"id": pricing_table_id, "tid": TENANT_ID})
        await session.commit()
        print("  ✅ Tabela de Preços criada")
    else:
        pricing_table_id = str(row[0])

    # 10. Contracts
    r = await session.execute(text("SELECT id FROM contracts_contracts WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    row = r.fetchone()
    contract_id = None
    if not row:
        contract_id = str(uuid7())
        await session.execute(text("""
            INSERT INTO contracts_contracts (id, tenant_id, company_id, status, effective_date, expiration_date, created_at, updated_at)
            VALUES (:id, :tid, :cid, 'ACTIVE', CURRENT_DATE, CURRENT_DATE + interval '1 year', NOW(), NOW())
        """), {"id": contract_id, "tid": TENANT_ID, "cid": COMPANY_1_ID})
        
        # Contract Version
        version_id = str(uuid7())
        await session.execute(text("""
            INSERT INTO contracts_contract_versions (id, tenant_id, contract_id, version_number, created_at)
            VALUES (:id, :tid, :cid, 1, NOW())
        """), {"id": version_id, "tid": TENANT_ID, "cid": contract_id})

        # Contract item
        offering_id = offering_ids.get("Coleta de RSU") or next(iter(offering_ids.values()))
        item_id = str(uuid7())
        uom_id = uom_ids.get("t") or next(iter(uom_ids.values()))
        await session.execute(text("""
            INSERT INTO contracts_contract_items (id, tenant_id, version_id, service_offering_id, unit_of_measure_id, quantity)
            VALUES (:id, :tid, :version_id, :service_offering_id, :uom_id, 100)
        """), {"id": item_id, "tid": TENANT_ID, "version_id": version_id, "service_offering_id": offering_id, "uom_id": uom_id})
        
        # Contract item snapshot
        await session.execute(text("""
            INSERT INTO contracts_contract_item_snapshots 
            (id, tenant_id, contract_item_id, service_name, unit_name, base_unit_price, total_base_price, surcharges_total, discounts_total, final_price, currency, created_at)
            VALUES (:id, :tid, :item_id, 'Coleta', 't', 150.0, 15000.0, 0, 0, 15000.0, 'BRL', NOW())
        """), {"id": str(uuid7()), "tid": TENANT_ID, "item_id": item_id})
        
        await session.commit()
        print("  ✅ Contrato criado")
    else:
        contract_id = str(row[0])

    # 11. Logistics Service Plans
    r = await session.execute(text("SELECT id FROM service_plan_plans WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    row = r.fetchone()
    service_plan_id = None
    if not row:
        service_plan_id = str(uuid7())
        await session.execute(text("""
            INSERT INTO service_plan_plans (id, version, tenant_id, company_id, contract_id, status, effective_date, expiration_date, created_at, updated_at)
            VALUES (:id, 1, :tid, :cid, :contract_id, 'ACTIVE', CURRENT_DATE, CURRENT_DATE + interval '1 year', NOW(), NOW())
        """), {"id": service_plan_id, "tid": TENANT_ID, "cid": COMPANY_1_ID, "contract_id": contract_id})
        
        offering_id = offering_ids.get("Coleta de RSU") or next(iter(offering_ids.values()))
        await session.execute(text("""
            INSERT INTO service_plan_schedules (id, plan_id, service_offering_id, service_name, quantity_snapshot, status)
            VALUES (:id, :plan_id, :offering_id, 'Coleta Semanal', 1.0, 'ACTIVE')
        """), {"id": str(uuid7()), "plan_id": service_plan_id, "offering_id": offering_id})
        
        await session.commit()
        print("  ✅ Planos de Serviço criados")
    else:
        service_plan_id = str(row[0])
        
    # 12. Logistics Service Orders
    r = await session.execute(text("SELECT id FROM logistics_service_orders WHERE tenant_id = :tid LIMIT 1"), {"tid": TENANT_ID})
    so_row = r.fetchone()
    if not so_row:
        so_id_1 = str(uuid7())
        so_id_2 = str(uuid7())
        
        for so_id, status, dt in [
            (so_id_1, "COMPLETED", "CURRENT_DATE - interval '2 days'"),
            (so_id_2, "SCHEDULED", "CURRENT_DATE + interval '1 day'")
        ]:
            await session.execute(text(f"""
                INSERT INTO logistics_service_orders (id, tenant_id, service_plan_id, company_id, scheduled_date, status, created_at, updated_at)
                VALUES (:id, :tid, :sp_id, :cid, {dt}, :status, NOW(), NOW())
            """), {"id": so_id, "tid": TENANT_ID, "sp_id": service_plan_id, "cid": COMPANY_1_ID, "status": status})
            
            # Service order item
            offering_id = offering_ids.get("Coleta de RSU") or next(iter(offering_ids.values()))
            await session.execute(text("""
                INSERT INTO logistics_service_order_items (id, service_order_id, service_offering_id, service_name, quantity)
                VALUES (:id, :so_id, :off_id, 'Coleta', '1.0')
            """), {"id": str(uuid7()), "so_id": so_id, "off_id": offering_id})
            
        await session.commit()
        print("  ✅ Ordens de Serviço (COMPLETED e SCHEDULED) criadas")
    else:
        so_id_1 = str(so_row[0])
        
    # 13. Billing Invoices
    r = await session.execute(text("SELECT COUNT(*) FROM billing_invoices WHERE tenant_id = :tid"), {"tid": TENANT_ID})
    if r.scalar() == 0:
        inv_id = str(uuid7())
        await session.execute(text("""
            INSERT INTO billing_invoices (id, tenant_id, company_id, reference_date, status, total_amount, due_date, created_at, updated_at)
            VALUES (:id, :tid, :cid, CURRENT_DATE, 'DRAFT', 150.0, CURRENT_DATE + interval '10 days', NOW(), NOW())
        """), {"id": inv_id, "tid": TENANT_ID, "cid": COMPANY_1_ID})
        
        await session.execute(text("""
            INSERT INTO billing_invoice_items (id, invoice_id, service_order_id, description, quantity, unit_price, total_price)
            VALUES (:id, :inv_id, :so_id, 'Coleta de RSU', 1.0, 150.0, 150.0)
        """), {"id": str(uuid7()), "inv_id": inv_id, "so_id": so_id_1})
        
        await session.commit()
        print("  ✅ Faturas criadas")

    print("\n" + "="*55)
    print("✅  Seed Completo concluído com sucesso!")
    print("="*55)


async def main():
    engine = create_async_engine(DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    try:
        async with session_factory() as session:
            await seed(session)
    except Exception as exc:
        print(f"\n❌ Erro durante o seed: {exc}")
        import traceback; traceback.print_exc()
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
