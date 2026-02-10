from config import db
from backend.relations import workflow_operation

class Workflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    operations = db.relationship('Operation', secondary=workflow_operation, backref='workflows')
    
    def to_json(self):
        return {
            "id": self.id,
            "operations": [operation.id for operation in self.operations]
        }