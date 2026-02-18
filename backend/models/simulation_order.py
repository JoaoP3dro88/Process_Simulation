from __future__ import annotations

from datetime import datetime

from config import db


class SimulationOrder(db.Model):
    __tablename__ = "simulation_order"

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    status = db.Column(db.String(32), nullable=False, default="created")  # created|in_progress|done

    items = db.relationship(
        "SimulationOrderItem",
        backref="order",
        cascade="all, delete-orphan",
        lazy=True,
    )

    jobs = db.relationship(
        "SimulationJob",
        backref="order",
        cascade="all, delete-orphan",
        lazy=True,
    )

    def to_json(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "status": self.status,
            "items": [i.to_json() for i in self.items],
        }
