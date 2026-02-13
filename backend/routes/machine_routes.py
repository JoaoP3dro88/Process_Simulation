from flask import Blueprint, request, jsonify
from models.operation import Operation
from models.machine import Machine
from models.workstation import Workstation
from config import db

machine_bp = Blueprint('machine_bp', __name__)

# GET /machines - Listar máquinas
@machine_bp.route('/machines', methods=['GET'])
def get_machines():
    machines = Machine.query.all()
    return jsonify([m.to_json() for m in machines])

# GET /machines/<id> - Buscar máquina específica
@machine_bp.route('/machines/<int:id>', methods=['GET'])
def get_machine(id):
    machine = Machine.query.get_or_404(id)
    return jsonify(machine.to_json())

# POST /machines - Criar máquina
@machine_bp.route('/machines', methods=['POST'])
def create_machine():
    data = request.json
    machine = Machine(name=data['name'], capacity=data['capacity'])
    db.session.add(machine)
    db.session.commit()
    return jsonify(machine.to_json()), 201

# PUT /machines/<id> - Atualizar máquina
@machine_bp.route('/machines/<int:id>', methods=['PUT'])
def update_machine(id):
    machine = Machine.query.get_or_404(id)
    data = request.json
    machine.name = data.get('name', machine.name)
    machine.capacity = data.get('capacity', machine.capacity)
    db.session.commit()
    return jsonify(machine.to_json())

# DELETE /machines/<id> - Deletar máquina
@machine_bp.route('/machines/<int:id>', methods=['DELETE'])
def delete_machine(id):
    machine = Machine.query.get_or_404(id)
    db.session.delete(machine)
    db.session.commit()
    return jsonify({"message": "Machine deleted"})

# GET /machines/<id>/operations - Listar operações possíveis na máquina
@machine_bp.route('/machines/<int:id>/operations', methods=['GET'])
def get_machine_operations(id):
    machine = Machine.query.get_or_404(id)
    return jsonify([op.to_json() for op in machine.operations])

# GET /machines/<id>/workstation - Buscar workstation da máquina (N:1)
@machine_bp.route('/machines/<int:id>/workstation', methods=['GET'])
def get_machine_workstation(id):
    machine = Machine.query.get_or_404(id)
    if not machine.workstation_id:
        return jsonify(None), 200
    return jsonify(machine.workstation.to_json())

# POST /machines/<id>/operations - Adicionar operação à máquina
@machine_bp.route('/machines/<int:id>/operations', methods=['POST'])
def add_operation_to_machine(id):
    machine = Machine.query.get_or_404(id)
    data = request.json
    operation = Operation.query.get_or_404(data['operation_id'])
    if operation not in machine.operations:
        machine.operations.append(operation)
        db.session.commit()
        return jsonify({"message": "Operation added to machine"})
    else:
        return jsonify({"message": "Operation already exists in machine"}), 400

# DELETE /machines/<id>/operations/<operation_id> - Remover operação da máquina
@machine_bp.route('/machines/<int:id>/operations/<int:operation_id>', methods=['DELETE'])
def remove_operation_from_machine(id, operation_id):
    machine = Machine.query.get_or_404(id)
    operation = Operation.query.get_or_404(operation_id)
    if operation in machine.operations:
        machine.operations.remove(operation)
        db.session.commit()
        return jsonify({"message": "Operation removed from machine"})
    else:
        return jsonify({"message": "Operation not found in machine"}), 404

# PUT /machines/<id>/workstation - Mudar máquina de workstation
@machine_bp.route('/machines/<int:id>/workstation', methods=['PUT'])
def change_machine_workstation(id):
    machine = Machine.query.get_or_404(id)
    data = request.json
    new_workstation = Workstation.query.get_or_404(data['workstation_id'])
    machine.workstation_id = new_workstation.id  # ajuste conforme seu modelo
    db.session.commit()
    return jsonify({"message": "Machine moved to new workstation"})