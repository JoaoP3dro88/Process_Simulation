from config import db

# Tabela associativa
workflow_operation = db.Table(
    'workflow_operation',
    db.Column('workflow_id', db.Integer, db.ForeignKey('workflow.id'), primary_key=True),
    db.Column('operation_id', db.Integer, db.ForeignKey('operation.id'), primary_key=True)
)