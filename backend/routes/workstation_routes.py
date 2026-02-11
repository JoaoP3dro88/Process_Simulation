from flask import Blueprint, request, jsonify
from models.workstation import Workstation
from models.machine import Machine
from models.operator import Operator
from config import db

workstation_bp = Blueprint('workstation_bp', __name__)

# GET /workstations - Listar workstations
@workstation_bp.route('/workstations', methods=['GET'])
def get_workstations():
    workstations = Workstation.query.all()
    return jsonify([ws.to_json() for ws in workstations])

# GET /workstations/<id> - Buscar workstation específica
@workstation_bp.route('/workstations/<int:id>', methods=['GET'])
def get_workstation(id):
    workstation = Workstation.query.get_or_404(id)
    return jsonify(workstation.to_json())

# POST /workstations - Criar workstation
@workstation_bp.route('/workstations', methods=['POST'])
def create_workstation():
    data = request.json or {}
    workstation = Workstation(process_id=data.get('process_id'))
    db.session.add(workstation)
    db.session.commit()
    return jsonify(workstation.to_json()), 201

# PUT /workstations/<id> - Atualizar workstation
@workstation_bp.route('/workstations/<int:id>', methods=['PUT'])
def update_workstation(id):
    workstation = Workstation.query.get_or_404(id)
    data = request.json or {}
    workstation.process_id = data.get('process_id', workstation.process_id)
    db.session.commit()
    return jsonify(workstation.to_json())

# DELETE /workstations/<id> - Deletar workstation
@workstation_bp.route('/workstations/<int:id>', methods=['DELETE'])
def delete_workstation(id):
    workstation = Workstation.query.get_or_404(id)
    db.session.delete(workstation)
    db.session.commit()
    return jsonify({"message": "Workstation deleted"})

# GET /workstations/<id>/machines - Listar máquinas da workstation
@workstation_bp.route('/workstations/<int:id>/machines', methods=['GET'])
def get_workstation_machines(id):
    workstation = Workstation.query.get_or_404(id)
    return jsonify([m.to_json() for m in workstation.machines])

# GET /workstations/<id>/operators - Listar operadores da workstation
@workstation_bp.route('/workstations/<int:id>/operators', methods=['GET'])
def get_workstation_operators(id):
    workstation = Workstation.query.get_or_404(id)
    return jsonify([op.to_json() for op in workstation.operators])

# GET /workstations/<id>/process - Buscar processo atribuído (1)
@workstation_bp.route('/workstations/<int:id>/process', methods=['GET'])
def get_workstation_process(id):
    workstation = Workstation.query.get_or_404(id)
    return jsonify({"process_id": workstation.process_id})
    
# POST /workstations/<id>/operators - Adicionar operador (M:N)
@workstation_bp.route('/workstations/<int:id>/operators', methods=['POST'])
def add_operator_to_workstation(id):
    workstation = Workstation.query.get_or_404(id)
    data = request.json or {}
    operator = Operator.query.get_or_404(data['operator_id'])
    if operator not in workstation.operators:
        workstation.operators.append(operator)
        db.session.commit()
    return jsonify(workstation.to_json())
    
# DELETE /workstations/<id>/operators/<operator_id> - Remover operador (M:N)
@workstation_bp.route('/workstations/<int:id>/operators/<int:operator_id>', methods=['DELETE'])
def remove_operator_from_workstation(id, operator_id):
    workstation = Workstation.query.get_or_404(id)
    operator = Operator.query.get_or_404(operator_id)
    if operator in workstation.operators:
        workstation.operators.remove(operator)
        db.session.commit()
    return jsonify(workstation.to_json())