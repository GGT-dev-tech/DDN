from sqlalchemy import create_engine, text
engine = create_engine('postgresql+psycopg://stitch_admin:secret_postgres@localhost:5435/stitch_db')
with engine.connect() as conn:
    conn.execute(text('DROP TYPE IF EXISTS quotationstatus;'))
    conn.commit()
    conn.execute(text('DROP TYPE IF EXISTS contractstatus;'))
    conn.commit()
