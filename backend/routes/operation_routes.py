from flask import Blueprint, request, jsonify
from models.operation import Operation
from config import db

operation_bp = Blueprint('operation_bp', __name__)

# GET /operations - Listar operações
@operation_bp.route('/operations', methods=['GET'])
def get_operations():
    operations = Operation.query.all()
    return jsonify([op.to_json() for op in operations])

# GET /operations/<id> - Buscar operação específica
@operation_bp.route('/operations/<int:id>', methods=['GET'])
def get_operation(id):
    operation = Operation.query.get_or_404(id)
    return jsonify(operation.to_json())

# POST /operations - Criar operação
@operation_bp.route('/operations', methods=['POST'])
def create_operation():
    data = request.json
    operation = Operation(name=data['name'])
    db.session.add(operation)
    db.session.commit()
    return jsonify(operation.to_json()), 201

# PUT /operations/<id> - Atualizar operação
@operation_bp.route('/operations/<int:id>', methods=['PUT'])
def update_operation(id):
    operation = Operation.query.get_or_404(id)
    data = request.json
    operation.name = data.get('name', operation.name)
    db.session.commit()
    return jsonify(operation.to_json())

# DELETE /operations/<id> - Deletar operação
@operation_bp.route('/operations/<int:id>', methods=['DELETE'])
def delete_operation(id):
    operation = Operation.query.get_or_404(id)
    db.session.delete(operation)
    db.session.commit()
    return jsonify({"message": "Operation deleted"})