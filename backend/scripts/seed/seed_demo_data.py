"""
Seed script para popular o banco de dados com dados de demonstração.
Cria: usuário admin, tenant, veículos, motoristas, clientes (leads), 
      catálogo de serviços (UOMs + Offerings).

Como usar:
    cd /caminho/para/ddn_management/backend
    python scripts/seed/seed_demo_data.py

    # Ou com DATABASE_URL customizado:
    DATABASE_URL="postgresql+asyncpg://..." python scripts/seed/seed_demo_data.py
"""
import asyncio
import sys
import os
from uuid import UUID

# Adiciona o backend ao path para imports funcionarem
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import bcrypt
from uuid6 import uuid7
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# ---------------------------------------------------------------------------
# Configuração do banco
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/ddn_management"
)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# IDs fixos para facilitar reprodutibilidade
TENANT_ID = "00000000-0000-0000-0000-000000000001"
USER_ID   = "00000000-0000-0000-0000-000000000002"

def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")

# ---------------------------------------------------------------------------
async def seed(session: AsyncSession):
    print("🌱 Iniciando seed de dados de demonstração...\n")

    # ------------------------------------------------------------------
    # 1. Tenant
    # ------------------------------------------------------------------
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
    else:
        print("  ⏭️  Tenant já existe")

    # ------------------------------------------------------------------
    # 2. Usuário admin
    # ------------------------------------------------------------------
    r = await session.execute(text("SELECT id FROM users WHERE id = :id"), {"id": USER_ID})
    if not r.fetchone():
        pw_hash = hash_password("stitchadmin")
        await session.execute(text("""
            INSERT INTO users (id, email, password_hash, status, created_at, updated_at, email_verified_at)
            VALUES (:id, :email, :password_hash, 'ACTIVE', NOW(), NOW(), NOW())
        """), {"id": USER_ID, "email": "admin@stitch.com", "password_hash": pw_hash})
        print("  ✅ Usuário admin criado  →  admin@stitch.com / stitchadmin")
    else:
        print("  ⏭️  Usuário já existe")

    # ------------------------------------------------------------------
    # 3. TenantUser
    # ------------------------------------------------------------------
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
    else:
        print("  ⏭️  TenantUser já existe")

    await session.commit()

    # ------------------------------------------------------------------
    # 4. Veículos
    # ------------------------------------------------------------------
    r = await session.execute(
        text("SELECT COUNT(*) FROM fleet_vehicles WHERE tenant_id = :tid"), {"tid": TENANT_ID}
    )
    if r.scalar() == 0:
        vehicles = [
            ("ABC1234", "COMPACTOR_TRUCK", 15.0, 10.0, "ACTIVE"),
            ("DEF5678", "COMPACTOR_TRUCK", 12.0,  8.0, "ACTIVE"),
            ("GHI9012", "ROLL_OFF_TRUCK",  30.0, 20.0, "MAINTENANCE"),
            ("JKL3456", "VAN",              5.0,  2.5, "ACTIVE"),
        ]
        for plate, vtype, vol, wgt, status in vehicles:
            await session.execute(text("""
                INSERT INTO fleet_vehicles (id, tenant_id, license_plate, vehicle_type, capacity_volume, capacity_weight, status)
                VALUES (
                    :id, :tenant_id, :plate,
                    CAST(:vtype AS vehicletype),
                    :vol, :wgt,
                    CAST(:status AS vehiclestatus)
                )
            """), {
                "id": str(uuid7()), "tenant_id": TENANT_ID,
                "plate": plate, "vtype": vtype, "vol": vol, "wgt": wgt, "status": status
            })
        await session.commit()
        print(f"  ✅ {len(vehicles)} veículos criados")
    else:
        print("  ⏭️  Veículos já existem")

    # ------------------------------------------------------------------
    # 5. Motoristas
    # ------------------------------------------------------------------
    r = await session.execute(
        text("SELECT COUNT(*) FROM fleet_drivers WHERE tenant_id = :tid"), {"tid": TENANT_ID}
    )
    if r.scalar() == 0:
        drivers = [
            ("Carlos Eduardo Silva",  "12345678901", "AVAILABLE"),
            ("Marcos Antônio Santos", "23456789012", "AVAILABLE"),
            ("Roberto Lima Pereira",  "34567890123", "OFF_DUTY"),
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
        print(f"  ✅ {len(drivers)} motoristas criados")
    else:
        print("  ⏭️  Motoristas já existem")

    # ------------------------------------------------------------------
    # 6. Leads (Clientes)
    # ------------------------------------------------------------------
    r = await session.execute(
        text("SELECT COUNT(*) FROM commercial_leads WHERE tenant_id = :tid"), {"tid": TENANT_ID}
    )
    if r.scalar() == 0:
        leads = [
            ("Supermercados Bom Preço",    "Ana Paula Ferreira",   "ana@bomprecao.com.br",   "11987654321", "QUALIFIED"),
            ("Hospital São Lucas",          "Dr. Paulo Rodrigues",  "paulo@saolucas.com.br",  "11912345678", "QUALIFIED"),
            ("Indústria Metalúrgica ABC",   "Renato Carvalho",      "renato@metalurgica.com.br","11965432109","NEW"),
            ("Condomínio Parque Verde",     "Sônia Menezes",        "sonia@pqverde.com.br",   "11943219876", "CONTACTED"),
        ]
        for company, contact, email, phone, status in leads:
            await session.execute(text("""
                INSERT INTO commercial_leads
                  (id, tenant_id, company_name, contact_name, email, phone, status, created_at, updated_at)
                VALUES
                  (:id, :tid, :company, :contact, :email, :phone, :status, NOW(), NOW())
            """), {
                "id": str(uuid7()), "tid": TENANT_ID,
                "company": company, "contact": contact,
                "email": email, "phone": phone, "status": status
            })
        await session.commit()
        print(f"  ✅ {len(leads)} leads/clientes criados")
    else:
        print("  ⏭️  Leads já existem")

    # ------------------------------------------------------------------
    # 7. Catálogo — UOMs
    # ------------------------------------------------------------------
    r = await session.execute(
        text("SELECT COUNT(*) FROM catalog_units_of_measure WHERE tenant_id = :tid"), {"tid": TENANT_ID}
    )
    uom_count = r.scalar()
    uom_ids = {}
    if uom_count == 0:
        uoms = [
            ("Tonelada",     "t",   "WEIGHT"),
            ("Quilograma",   "kg",  "WEIGHT"),
            ("Metro Cúbico", "m³",  "VOLUME"),
            ("Coleta",       "col", "UNIT"),
            ("Hora",         "h",   "TIME"),
        ]
        for name, symbol, base_type in uoms:
            uid = str(uuid7())
            uom_ids[symbol] = uid
            await session.execute(text("""
                INSERT INTO catalog_units_of_measure (id, tenant_id, symbol, name, base_type, created_at, updated_at)
                VALUES (:id, :tid, :symbol, :name, :base_type, NOW(), NOW())
            """), {
                "id": uid, "tid": TENANT_ID,
                "symbol": symbol, "name": name, "base_type": base_type
            })
        await session.commit()
        print(f"  ✅ {len(uoms)} UOMs criadas")
    else:
        print(f"  ⏭️  UOMs já existem ({uom_count})")
        r2 = await session.execute(
            text("SELECT symbol, id FROM catalog_units_of_measure WHERE tenant_id = :tid"),
            {"tid": TENANT_ID}
        )
        for row in r2.fetchall():
            uom_ids[row[0]] = str(row[1])

    # ------------------------------------------------------------------
    # 8. Catálogo — Service Offerings
    # ------------------------------------------------------------------
    r = await session.execute(
        text("SELECT COUNT(*) FROM catalog_service_offerings WHERE tenant_id = :tid"), {"tid": TENANT_ID}
    )
    if r.scalar() == 0:
        default_uom = uom_ids.get("t") or uom_ids.get("col") or next(iter(uom_ids.values()), None)
        if not default_uom:
            print("  ⚠️  Nenhuma UOM encontrada para vincular ao offering, pulando...")
        else:
            offerings = [
                ("Coleta de Resíduos Sólidos Urbanos",  "Coleta domiciliar e comercial de RSU",           "WASTE_COLLECTION"),
                ("Coleta de Resíduos Hospitalares",     "Coleta e transporte de RSS classe A e B",        "WASTE_COLLECTION"),
                ("Coleta de Resíduos Industriais",      "Coleta de resíduos industriais classe I e II",   "WASTE_COLLECTION"),
                ("Varrição Mecanizada",                 "Varrição de vias com equipamento especial",      "SWEEPING"),
            ]
            for name, desc, category in offerings:
                await session.execute(text("""
                    INSERT INTO catalog_service_offerings
                      (id, tenant_id, name, description, category, status, default_uom_id, effective_date, created_at, updated_at)
                    VALUES
                      (:id, :tid, :name, :desc, :category, 'ACTIVE', :uom_id, CURRENT_DATE, NOW(), NOW())
                """), {
                    "id": str(uuid7()), "tid": TENANT_ID,
                    "name": name, "desc": desc, "category": category,
                    "uom_id": default_uom
                })
            await session.commit()
            print(f"  ✅ {len(offerings)} serviços do catálogo criados")
    else:
        print("  ⏭️  Offerings do catálogo já existem")

    print("\n" + "="*55)
    print("✅  Seed concluído com sucesso!")
    print("="*55)
    print("\n📋 Credenciais de acesso:")
    print(f"   Email:     admin@stitch.com")
    print(f"   Senha:     stitchadmin")
    print(f"\n   Tenant ID: {TENANT_ID}")
    print(f"   User ID:   {USER_ID}")


# ---------------------------------------------------------------------------
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
