from flask import Blueprint, request, jsonify
from models.workflow import Workflow
from models.operation import Operation
from config import db

workflow_bp = Blueprint('workflow_bp', __name__)

# GET /workflows - Listar workflows
@workflow_bp.route('/workflows', methods=['GET'])
def get_workflows():
    workflows = Workflow.query.all()
    return jsonify([w.to_json() for w in workflows])

# GET /workflows/<id> - Buscar workflow específico
@workflow_bp.route('/workflows/<int:id>', methods=['GET'])
def get_workflow(id):
    workflow = Workflow.query.get_or_404(id)
    return jsonify(workflow.to_json())

# POST /workflows - Criar workflow
@workflow_bp.route('/workflows', methods=['POST'])
def create_workflow():
    # O modelo Workflow atualmente não tem coluna `name`.
    # Mantemos o endpoint, mas não exigimos payload.
    workflow = Workflow()
    db.session.add(workflow)
    db.session.commit()
    return jsonify(workflow.to_json()), 201

# PUT /workflows/<id> - Atualizar workflow
@workflow_bp.route('/workflows/<int:id>', methods=['PUT'])
def update_workflow(id):
    workflow = Workflow.query.get_or_404(id)
    # Não há campos escalares para atualizar no modelo atual.
    # Se no futuro você adicionar um campo (ex: name), pode reativar aqui.
    return jsonify(workflow.to_json())

# DELETE /workflows/<id> - Deletar workflow
@workflow_bp.route('/workflows/<int:id>', methods=['DELETE'])
def delete_workflow(id):
    workflow = Workflow.query.get_or_404(id)
    db.session.delete(workflow)
    db.session.commit()
    return jsonify({"message": "Workflow deleted"})

# GET /workflows/<id>/operations - Listar operações do workflow
@workflow_bp.route('/workflows/<int:id>/operations', methods=['GET'])
def get_workflow_operations(id):
    workflow = Workflow.query.get_or_404(id)
    # Supondo que exista uma relação 'operations' em Workflow
    return jsonify([op.to_json() for op in workflow.operations])

# POST /workflows/<id>/operations - Adicionar operação ao workflow
@workflow_bp.route('/workflows/<int:id>/operations', methods=['POST'])
def add_operation_to_workflow(id):
    workflow = Workflow.query.get_or_404(id)
    data = request.json or {}
    if 'operation_id' not in data:
        return jsonify({"error": "Field 'operation_id' is required"}), 400

    operation = Operation.query.get_or_404(data['operation_id'])
    if operation in workflow.operations:
        return jsonify({"message": "Operation already exists in workflow"}), 400

    workflow.operations.append(operation)
    db.session.commit()
    return jsonify(workflow.to_json())

# DELETE /workflows/<id>/operations/<operation_id> - Remover operação
@workflow_bp.route('/workflows/<int:id>/operations/<int:operation_id>', methods=['DELETE'])
def remove_operation_from_workflow(id, operation_id):
    workflow = Workflow.query.get_or_404(id)
    operation = Operation.query.get_or_404(operation_id)
    if operation in workflow.operations:
        workflow.operations.remove(operation)
        db.session.commit()
        return jsonify({"message": "Operation removed from workflow"})
    else:
        return jsonify({"message": "Operation not found in workflow"}), 404