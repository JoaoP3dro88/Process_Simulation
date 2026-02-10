from config import db

class MarketPartQuantity(db.Model):
    __tablename__ = 'market_part_quantity'
    market_id = db.Column(db.Integer, db.ForeignKey('market.id'), primary_key=True)
    part_id = db.Column(db.Integer, db.ForeignKey('part.id'), primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)

    part = db.relationship("Part")