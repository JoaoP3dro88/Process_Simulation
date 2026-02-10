from config import db
from models.market_part_quantity import MarketPartQuantity

class Market(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_process_id = db.Column(db.Integer, db.ForeignKey('process.id'), nullable=True)
    next_process_id = db.Column(db.Integer, db.ForeignKey('process.id'), nullable=True)
    parts = db.relationship('MarketPartQuantity', backref='market', cascade="all, delete-orphan")

    def to_json(self):
        return {
            "id": self.id,
            "last_process_id": self.last_process_id,
            "next_process_id": self.next_process_id,
            "parts": [part.to_json() for part in self.parts]
        }