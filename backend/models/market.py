from config import db
from models.market_part_quantity import MarketPartQuantity

class Market(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_process_id = db.Column(db.Integer, db.ForeignKey('process.id'), nullable=True)
    next_process_id = db.Column(db.Integer, db.ForeignKey('process.id'), nullable=True)

    parts = db.relationship('MarketPartQuantity', backref='market', cascade="all, delete-orphan")

