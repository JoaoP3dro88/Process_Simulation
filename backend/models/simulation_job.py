from __future__ import annotations

from datetime import datetime

from config import db


class SimulationJob(db.Model):
    __tablename__ = "simulation_job"

    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(db.Integer, db.ForeignKey("simulation_order.id"), nullable=False)
    part_id = db.Column(db.Integer, db.ForeignKey("part.id"), nullable=False)

    # Which operation in the workflow is next
    next_op_index = db.Column(db.Integer, nullable=False, default=0)

    status = db.Column(
        db.String(32),
        nullable=False,
        default="queued",  # queued|running|done
    )

    # Running info
    machine_id = db.Column(db.Integer, db.ForeignKey("machine.id"), nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)
    finished_at = db.Column(db.DateTime, nullable=True)

    part = db.relationship("Part")
    machine = db.relationship("Machine")

    def to_json(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "part_id": self.part_id,
            "next_op_index": self.next_op_index,
            "status": self.status,
            "machine_id": self.machine_id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "finished_at": self.finished_at.isoformat() if self.finished_at else None,
        }
