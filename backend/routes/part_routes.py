from flask import Blueprint, request, jsonify
from models.part import Part
from models.workflow import Workflow
from config import db

part_bp = Blueprint('part_bp', __name__)

# GET /parts - Listar todas as partes
@part_bp.route('/parts', methods=['GET'])
def get_parts():
    parts = Part.query.all()
    return jsonify([p.to_json() for p in parts])

# GET /parts/<id> - Buscar parte específica
@part_bp.route('/parts/<int:id>', methods=['GET'])
def get_part(id):
    part = Part.query.get_or_404(id)
    return jsonify(part.to_json())

# POST /parts - Criar parte
@part_bp.route('/parts', methods=['POST'])
def create_part():
    data = request.json or {}

    if 'workflow_id' not in data:
        return jsonify({"error": "workflow_id é obrigatório"}), 400

    workflow_id = data['workflow_id']
    Workflow.query.get_or_404(workflow_id)

    existing = Part.query.filter_by(workflow_id=workflow_id).first()
    if existing:
        return jsonify({"error": "Esse workflow já está associado a outra part.", "part_id": existing.id}), 409

    part = Part(name=data['name'], workflow_id=workflow_id)
    db.session.add(part)
    db.session.commit()
    return jsonify(part.to_json()), 201

# PUT /parts/<id> - Atualizar parte
@part_bp.route('/parts/<int:id>', methods=['PUT'])
def update_part(id):
    part = Part.query.get_or_404(id)
    data = request.json or {}

    if 'name' in data:
        part.name = data['name']

    if 'workflow_id' in data:
        workflow_id = data['workflow_id']

        if workflow_id is not None:
            Workflow.query.get_or_404(workflow_id)
            existing = Part.query.filter(Part.workflow_id == workflow_id, Part.id != part.id).first()
            if existing:
                return jsonify({"error": "Esse workflow já está associado a outra part.", "part_id": existing.id}), 409

        part.workflow_id = workflow_id

    db.session.commit()
    return jsonify(part.to_json())

# DELETE /parts/<id> - Deletar parte
@part_bp.route('/parts/<int:id>', methods=['DELETE'])
def delete_part(id):
    part = Part.query.get_or_404(id)
    db.session.delete(part)
    db.session.commit()
    return jsonify({"message": "Part deleted"})

# GET /parts/<id>/workflow - Buscar workflow da parte
@part_bp.route('/parts/<int:id>/workflow', methods=['GET'])
def get_part_workflow(id):
    part = Part.query.get_or_404(id)
    if not part.workflow_id:
        return jsonify(None), 200
    workflow = Workflow.query.get_or_404(part.workflow_id)
    return jsonify(workflow.to_json())

# GET /parts/<id>/processes - Listar processos relacionados à parte
@part_bp.route('/parts/<int:id>/processes', methods=['GET'])
def get_part_processes(id):
    part = Part.query.get_or_404(id)
    return jsonify([process.to_json() for process in part.processes])