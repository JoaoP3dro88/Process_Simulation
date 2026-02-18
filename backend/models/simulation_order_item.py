from __future__ import annotations

from config import db


class SimulationOrderItem(db.Model):
    __tablename__ = "simulation_order_item"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("simulation_order.id"), nullable=False)

    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    product = db.relationship("Product")

    def to_json(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
        }
