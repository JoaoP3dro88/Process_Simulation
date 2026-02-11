from config import db

class Part(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=False, nullable=False)

    # Workflow-Part 1:1 -> workflow_id precisa ser UNIQUE
    workflow_id = db.Column(db.Integer, db.ForeignKey('workflow.id'), nullable=False, unique=True)

    # Relacionamento direto para acessar o workflow da peça
    workflow = db.relationship(
        'Workflow',
        backref=db.backref('part', uselist=False),  # Workflow.part (1 item, não lista)
        lazy=True
    )

    def to_json(self):
        return {
            "id": self.id,
            "name": self.name,
            "workflow_id": self.workflow_id
        }