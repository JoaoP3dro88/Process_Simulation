from config import db
from relations.workflow_part import workflow_part

class Part(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    workflows = db.relationship('Workflow', secondary=workflow_part, backref='parts')