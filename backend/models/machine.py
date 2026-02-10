from backend.relations import machine_operation
from config import db

class Machine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    operations = db.relationship('Operation', secondary=machine_operation, backref='machine', lazy=True)
    capacity = db.Column(db.Integer, nullable=False)
