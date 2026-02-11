from flask import Blueprint, request, jsonify
from models.operator import Operator
from config import db

operator_bp = Blueprint('operator_bp', __name__)

# GET /operators - Listar operadores
@operator_bp.route('/operators', methods=['GET'])
def get_operators():
    operators = Operator.query.all()
    return jsonify([op.to_json() for op in operators])

# GET /operators/<id> - Buscar operador específico
@operator_bp.route('/operators/<int:id>', methods=['GET'])
def get_operator(id):
    operator = Operator.query.get_or_404(id)
    return jsonify(operator.to_json())

# POST /operators - Criar operador
@operator_bp.route('/operators', methods=['POST'])
def create_operator():
    data = request.json
    operator = Operator(name=data['name'])
    db.session.add(operator)
    db.session.commit()
    return jsonify(operator.to_json()), 201

# PUT /operators/<id> - Atualizar operador
@operator_bp.route('/operators/<int:id>', methods=['PUT'])
def update_operator(id):
    operator = Operator.query.get_or_404(id)
    data = request.json
    operator.name = data.get('name', operator.name)
    db.session.commit()
    return jsonify(operator.to_json())

# DELETE /operators/<id> - Deletar operador
@operator_bp.route('/operators/<int:id>', methods=['DELETE'])
def delete_operator(id):
    operator = Operator.query.get_or_404(id)
    db.session.delete(operator)
    db.session.commit()
    return jsonify({"message": "Operator deleted"})

# GET /operators/<id>/workstations - Listar workstations do operador
@operator_bp.route('/operators/<int:id>/workstations', methods=['GET'])
def get_operator_workstations(id):
    operator = Operator.query.get_or_404(id)
    # Supondo que exista uma relação 'workstations' em Operator
    return jsonify([ws.to_json() for ws in operator.workstations])