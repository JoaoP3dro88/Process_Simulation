from flask import Blueprint, request, jsonify
from models.process import Process
from config import db

process_bp = Blueprint('process_bp', __name__)

# GET /processes - Listar processos
@process_bp.route('/processes', methods=['GET'])
def get_processes():
    processes = Process.query.all()
    return jsonify([p.to_json() for p in processes])

# GET /processes/<id> - Buscar processo específico
@process_bp.route('/processes/<int:id>', methods=['GET'])
def get_process(id):
    process = Process.query.get_or_404(id)
    return jsonify(process.to_json())

# POST /processes - Criar processo
@process_bp.route('/processes', methods=['POST'])
def create_process():
    data = request.json or {}
    process = Process(name=data['name'])
    db.session.add(process)
    db.session.commit()
    return jsonify(process.to_json()), 201

# PUT /processes/<id> - Atualizar processo
@process_bp.route('/processes/<int:id>', methods=['PUT'])
def update_process(id):
    process = Process.query.get_or_404(id)
    data = request.json or {}
    process.name = data.get('name', process.name)
    db.session.commit()
    return jsonify(process.to_json())

# DELETE /processes/<id> - Deletar processo
@process_bp.route('/processes/<int:id>', methods=['DELETE'])
def delete_process(id):
    process = Process.query.get_or_404(id)
    db.session.delete(process)
    db.session.commit()
    return jsonify({"message": "Process deleted"})

# GET /processes/<id>/workstations - Listar workstations do processo
@process_bp.route('/processes/<int:id>/workstations', methods=['GET'])
def get_process_workstations(id):
    process = Process.query.get_or_404(id)
    # Supondo que exista uma relação 'workstations' em Process
    return jsonify([ws.to_json() for ws in process.workstations])

# GET /processes/<id>/parts - Listar partes relacionadas
@process_bp.route('/processes/<int:id>/parts', methods=['GET'])
def get_process_parts(id):
    process = Process.query.get_or_404(id)
    # Supondo que exista uma relação 'parts' em Process
    return jsonify([part.to_json() for part in process.parts])