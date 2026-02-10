from config import db

# Tabela associativa
workstation_operator = db.Table(
    'workstation_operator',
    db.Column('workstation_id', db.Integer, db.ForeignKey('workstation.id'), primary_key=True),
    db.Column('operator_id', db.Integer, db.ForeignKey('operator.id'), primary_key=True)
)
