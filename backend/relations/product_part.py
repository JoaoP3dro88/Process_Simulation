from config import db

# Tabela associativa
product_part = db.Table(
    'product_part',
    db.Column('product_id', db.Integer, db.ForeignKey('product.id'), primary_key=True),
    db.Column('part_id', db.Integer, db.ForeignKey('part.id'), primary_key=True)
)