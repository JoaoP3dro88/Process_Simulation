from __future__ import annotations

from config import db


class WorkflowOperation(db.Model):
    """Association model to keep an explicit order of operations inside a workflow."""

    __tablename__ = "workflow_operation"

    workflow_id = db.Column(db.Integer, db.ForeignKey("workflow.id"), primary_key=True)
    operation_id = db.Column(db.Integer, db.ForeignKey("operation.id"), primary_key=True)

    # Explicit sequence (0-based). Lower comes first.
    sequence = db.Column(db.Integer, nullable=False, default=0)

    operation = db.relationship("Operation")


__all__ = ["WorkflowOperation"]