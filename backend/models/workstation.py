from config import db
from relations.workstation_operator import workstation_operator  # garante que a tabela é carregada

class Workstation(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # 1 Process -> N Workstations (FK fica em Workstation)
    process_id = db.Column(db.Integer, db.ForeignKey('process.id'), nullable=True)

    # Workstation <-> Operator (M:N)
    operators = db.relationship(
        'Operator',
        secondary=workstation_operator,  # usa o objeto importado (mais seguro que string)
        backref=db.backref('workstations', lazy=True),
        lazy=True
    )

    def to_json(self):
        return {
            "id": self.id,
            "process_id": self.process_id,
            "machines": [m.id for m in self.machines],
            "operators": [op.id for op in self.operators],
        }