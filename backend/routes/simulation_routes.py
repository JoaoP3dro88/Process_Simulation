from __future__ import annotations

from datetime import datetime

from flask import Blueprint, jsonify, request

from config import db
from models.machine import Machine
from models.market_part_quantity import MarketPartQuantity
from models.part import Part
from models.product import Product
from models.simulation_job import SimulationJob
from models.simulation_order import SimulationOrder
from models.simulation_order_item import SimulationOrderItem


simulation_bp = Blueprint("simulation_bp", __name__)


def _get_or_create_final_market_id() -> int:
    """Current MVP: use Market with smallest id as the final market.

    If none exists, create one.
    """

    from models.market import Market  # local import to avoid circular import

    m = Market.query.order_by(Market.id.asc()).first()
    if m:
        return m.id

    m = Market(last_process_id=None, next_process_id=None)
    db.session.add(m)
    db.session.commit()
    return m.id


def _workflow_ordered_operations(part: Part):
    wf = part.workflow
    if not wf:
        return []
    return list(wf.operations)


def _eligible_machines_for_operation(operation_id: int):
    # Machines have M:N to operations.
    return Machine.query.filter(Machine.operations.any(id=operation_id)).all()


def _machine_loads(order_id: int):
    # Count running jobs on each machine for capacity check.
    rows = (
        db.session.query(SimulationJob.machine_id, db.func.count(SimulationJob.id))
        .filter(SimulationJob.order_id == order_id)
        .filter(SimulationJob.status == "running")
        .filter(SimulationJob.machine_id.isnot(None))
        .group_by(SimulationJob.machine_id)
        .all()
    )
    return {mid: cnt for (mid, cnt) in rows}


@simulation_bp.route("/simulation/orders", methods=["POST"])
def create_order():
    """Create a simulation order and explode it into Part jobs.

    Payload:
      {"items": [{"product_id": 1, "quantity": 10}, ...]}

    Rules:
    - explode Product -> Parts. Each Part becomes `quantity` jobs.
    - each job must have Part.workflow.
    """

    data = request.json or {}
    items = data.get("items") or []
    if not isinstance(items, list) or len(items) == 0:
        return jsonify({"error": "'items' must be a non-empty list"}), 400

    order = SimulationOrder(status="created")
    db.session.add(order)
    db.session.flush()  # order.id

    for it in items:
        product_id = it.get("product_id")
        quantity = it.get("quantity")
        if not product_id or not quantity:
            return jsonify({"error": "Each item requires product_id and quantity"}), 400

        quantity = int(quantity)
        if quantity <= 0:
            return jsonify({"error": "quantity must be > 0"}), 400

        product = Product.query.get_or_404(int(product_id))
        db.session.add(
            SimulationOrderItem(order_id=order.id, product_id=product.id, quantity=quantity)
        )

        # explode parts
        for part in product.parts:
            if not part.workflow:
                return jsonify({"error": f"Part {part.id} has no workflow"}), 400

            for _ in range(quantity):
                db.session.add(SimulationJob(order_id=order.id, part_id=part.id))

    order.status = "in_progress"
    db.session.commit()
    return jsonify(order.to_json()), 201


@simulation_bp.route("/simulation/orders", methods=["GET"])
def list_orders():
    orders = SimulationOrder.query.order_by(SimulationOrder.id.desc()).all()
    return jsonify([o.to_json() for o in orders])


@simulation_bp.route("/simulation/orders/<int:order_id>", methods=["GET"])
def get_order(order_id: int):
    order = SimulationOrder.query.get_or_404(order_id)
    return jsonify(order.to_json())


@simulation_bp.route("/simulation/orders/<int:order_id>/jobs", methods=["GET"])
def list_jobs(order_id: int):
    SimulationOrder.query.get_or_404(order_id)
    jobs = SimulationJob.query.filter_by(order_id=order_id).order_by(SimulationJob.id.asc()).all()
    return jsonify([j.to_json() for j in jobs])


@simulation_bp.route("/simulation/orders/<int:order_id>/machines", methods=["GET"])
def order_machines_view(order_id: int):
    """Return machine-centric view: queue + running, based on current next operation of each job."""
    SimulationOrder.query.get_or_404(order_id)

    jobs = SimulationJob.query.filter_by(order_id=order_id).all()

    # bucket by required operation
    queue_by_machine = {}
    running_by_machine = {}

    for j in jobs:
        if j.status == "done":
            continue

        part = Part.query.get(j.part_id)
        ops = _workflow_ordered_operations(part)
        if j.next_op_index >= len(ops):
            continue

        next_op = ops[j.next_op_index]

        if j.status == "running" and j.machine_id:
            running_by_machine.setdefault(j.machine_id, []).append(j.to_json())
            continue

        # find candidate machines
        candidates = [m for m in _eligible_machines_for_operation(next_op.id)]
        for m in candidates:
            queue_by_machine.setdefault(m.id, []).append(
                {
                    **j.to_json(),
                    "next_operation": next_op.to_json(),
                }
            )

    machines = Machine.query.order_by(Machine.id.asc()).all()
    return jsonify(
        [
            {
                "machine": m.to_json(),
                "queue": queue_by_machine.get(m.id, []),
                "running": running_by_machine.get(m.id, []),
            }
            for m in machines
        ]
    )


@simulation_bp.route("/simulation/orders/<int:order_id>/machines/<int:machine_id>/start", methods=["POST"])
def start_next_job(order_id: int, machine_id: int):
    """Start processing one queued job on a machine.

    Payload: {"job_id": <optional>}.

    Capacity (option C): each machine can run up to `Machine.capacity` jobs concurrently.
    """

    SimulationOrder.query.get_or_404(order_id)
    machine = Machine.query.get_or_404(machine_id)

    loads = _machine_loads(order_id)
    running = loads.get(machine.id, 0)
    if running >= machine.capacity:
        return jsonify({"error": "Machine at capacity"}), 409

    data = request.json or {}
    requested_job_id = data.get("job_id")

    # pick candidate jobs
    jobs = SimulationJob.query.filter_by(order_id=order_id).filter(SimulationJob.status != "done").all()

    eligible = []
    for j in jobs:
        if j.status != "queued":
            continue
        part = Part.query.get(j.part_id)
        ops = _workflow_ordered_operations(part)
        if j.next_op_index >= len(ops):
            continue
        next_op = ops[j.next_op_index]
        # machine must support this operation
        if next_op not in machine.operations:
            continue
        eligible.append((j, next_op))

    if requested_job_id is not None:
        eligible = [(j, op) for (j, op) in eligible if j.id == int(requested_job_id)]

    if not eligible:
        return jsonify({"error": "No eligible queued jobs for this machine"}), 404

    job, op = sorted(eligible, key=lambda pair: pair[0].id)[0]

    job.status = "running"
    job.machine_id = machine.id
    job.started_at = datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "started", "job": job.to_json(), "operation": op.to_json()})


@simulation_bp.route("/simulation/orders/<int:order_id>/jobs/<int:job_id>/finish", methods=["POST"])
def finish_job_step(order_id: int, job_id: int):
    """Finish the current operation step of a job.

    - increments next_op_index
    - if finished final op: mark done and add 1 unit of Part to final Market
    """

    SimulationOrder.query.get_or_404(order_id)
    job = SimulationJob.query.get_or_404(job_id)
    if job.order_id != order_id:
        return jsonify({"error": "Job does not belong to order"}), 400

    if job.status != "running":
        return jsonify({"error": "Job must be running to finish"}), 409

    part = Part.query.get(job.part_id)
    ops = _workflow_ordered_operations(part)

    job.next_op_index += 1
    job.finished_at = datetime.utcnow()
    job.status = "queued"
    job.machine_id = None

    # if completed workflow
    if job.next_op_index >= len(ops):
        job.status = "done"

        market_id = _get_or_create_final_market_id()
        mpq = MarketPartQuantity.query.get((market_id, job.part_id))
        if mpq:
            mpq.quantity += 1
        else:
            mpq = MarketPartQuantity(market_id=market_id, part_id=job.part_id, quantity=1)
            db.session.add(mpq)

    db.session.commit()

    return jsonify({"message": "finished", "job": job.to_json()})
