from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Import all models to ensure they are registered with Base.metadata
from database.core.base import Base
from modules.core.config.settings import settings
from modules.pricing.infrastructure.orm_models import PricingPriceTableModel, PricingPriceTableItemModel, PricingRuleModel
from modules.quotations.infrastructure.orm_models import QuotationModel, QuotationItemModel, QuotationItemSnapshotModel
from modules.contracts.infrastructure.orm_models import ContractModel, ContractVersionModel, ContractItemModel, ContractItemSnapshotModel
from modules.logistics.infrastructure.orm_models import ORMServiceOrder, ORMServiceOrderItem
from modules.compliance.infrastructure.orm_models import ORMWasteManifest, ORMWasteItem
from modules.billing.infrastructure.orm_models import ORMInvoice, ORMInvoiceItem
from modules.commercial.infrastructure.models import CommercialLead, CommercialCompany, CommercialContact, CommercialServiceLocation, CommercialOpportunity
from modules.fleet.infrastructure.orm_models import VehicleModel, DriverModel

target_metadata = Base.metadata

def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and reflected and name not in target_metadata.tables:
        return False
    return True


# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = settings.db.migration_url.replace("postgresql://", "postgresql+psycopg://")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=include_object,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    url = settings.db.migration_url.replace("postgresql://", "postgresql+psycopg://")
    config.set_main_option("sqlalchemy.url", url)
    
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata, include_object=include_object
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
