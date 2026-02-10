from backend.relations import workstation_machine, workstation_operator
from config import db

class Workstation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    machines = db.relationship('Machine', secondary=workstation_machine, backref='workstation', lazy=True)
    operators = db.relationship('Operator', secondary=workstation_operator, backref='workstation', lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "machines": [machine.id for machine in self.machines],
            "operators": [operator.id for operator in self.operators]
        }