from config import db

class MarketPartQuantity(db.Model):
    __tablename__ = 'market_part_quantity'
    market_id = db.Column(db.Integer, db.ForeignKey('market.id'), primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), primary_key=True, lazy=True)
    quantity = db.Column(db.Integer, nullable=False)

    part = db.relationship("Part")

    def to_json(self):
        return {
            "part": self.part.id,
            "quantity": self.quantity
        }