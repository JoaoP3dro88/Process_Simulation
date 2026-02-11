from config import db
from relations.process_part import process_part

class Process(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)

    # 1 Process -> N Workstations (ver FK em Workstation.process_id)
    workstations = db.relationship('Workstation', backref='process', lazy=True)

    # Process <-> Part (M:N)
    parts = db.relationship('Part', secondary=process_part, backref='processes', lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "workstations": [ws.id for ws in self.workstations],
            "parts": [part.id for part in self.parts],
        }