from backend.relations import process_part
from config import db

class Process(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    workstations = db.relationship('Workstation', backref='process', lazy=True)
    parts = db.relationship('Part', secondary=process_part, backref='process', lazy=True)

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "workstations": [workstation.id for workstation in self.workstations],
            "parts": [part.id for part in self.parts]
        }