from config import db

# Tabela associativa
process_part = db.Table(
    'process_part',
    db.Column('process_id', db.Integer, db.ForeignKey('process.id'), primary_key=True),
    db.Column('part_id', db.Integer, db.ForeignKey('part.id'), primary_key=True)
)