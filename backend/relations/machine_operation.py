from config import db

# Tabela associativa
machine_operation = db.Table(
    'machine_operation',
    db.Column('machine_id', db.Integer, db.ForeignKey('machine.id'), primary_key=True),
    db.Column('operation_id', db.Integer, db.ForeignKey('operation.id'), primary_key=True)
)