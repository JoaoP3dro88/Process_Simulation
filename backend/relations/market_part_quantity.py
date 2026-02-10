from config import db

market_part_quantity = db.Table(
    'market_part_quantity',
    db.Column('market_id', db.Integer, db.ForeignKey('market.id'), primary_key=True),
    db.Column('part_id', db.Integer, db.ForeignKey('part.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False)
)