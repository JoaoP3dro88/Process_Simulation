from config import db
from relations.workflow_operation import WorkflowOperation

class Workflow(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    workflow_operations = db.relationship(
        "WorkflowOperation",
        backref="workflow",
        cascade="all, delete-orphan",
        order_by="WorkflowOperation.sequence",
        lazy=True,
    )

    @property
    def operations(self):
        """Convenience: ordered list of Operation based on workflow_operations.sequence."""
        return [wo.operation for wo in self.workflow_operations]

    def to_json(self):
        return {
            "id": self.id,
            "operations": [op.id for op in self.operations],
            "operations_detailed": [
                {"operation": wo.operation.to_json(), "sequence": wo.sequence}
                for wo in self.workflow_operations
            ],
            "part_id": self.part.id if getattr(self, "part", None) else None
        }