from config import db
from relations.workflow_operation import workflow_operation

class Workflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    operations = db.relationship(
        'Operation',
        secondary=workflow_operation,
        backref=db.backref('workflows', lazy=True),
        lazy=True
    )

    def to_json(self):
        return {
            "id": self.id,
            "operations": [op.id for op in self.operations],
            "part_id": self.part.id if getattr(self, "part", None) else None
        }