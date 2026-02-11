from config import db
from relations.machine_operation import machine_operation  # garante que a tabela é carregada

class Machine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    capacity = db.Column(db.Integer, nullable=False)

    # 1 Workstation -> N Machines
    workstation_id = db.Column(db.Integer, db.ForeignKey('workstation.id'), nullable=True)
    workstation = db.relationship('Workstation', backref=db.backref('machines', lazy=True), lazy=True)

    # Machine <-> Operation (M:N)
    operations = db.relationship(
        'Operation',
        secondary=machine_operation,  # usa o objeto importado
        backref=db.backref('machines', lazy=True),
        lazy=True
    )

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "capacity": self.capacity,
            "workstation_id": self.workstation_id,
            "operations": [op.to_json() for op in self.operations],
        }
