from config import db

# Tabela associativa
workstation_machine = db.Table(
    'workstation_machine',
    db.Column('workstation_id', db.Integer, db.ForeignKey('workstation.id'), primary_key=True),
    db.Column('machine_id', db.Integer, db.ForeignKey('machine.id'), primary_key=True)
)
