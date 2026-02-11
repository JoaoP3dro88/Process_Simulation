from config import db
from relations.product_part import product_part

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    parts = db.relationship('Part', secondary=product_part, backref='products')
    
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "parts": [part.id for part in self.parts]
        }