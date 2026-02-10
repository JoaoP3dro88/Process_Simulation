from config import db

# Tabela associativa
workflow_part = db.Table(
    'workflow_part',
    db.Column('workflow_id', db.Integer, db.ForeignKey('workflow.id'), primary_key=True),
    db.Column('part_id', db.Integer, db.ForeignKey('part.id'), primary_key=True)
)