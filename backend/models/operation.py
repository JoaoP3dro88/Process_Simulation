from config import db

class Operation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)
    duration = db.Column(db.Float, nullable=False)
    
    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "duration": self.duration
        }