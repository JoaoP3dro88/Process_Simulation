"""Smoke test for the new simulation endpoints.

It uses Flask's test_client (no server needed).

What it verifies:
- create Operations
- create Workflow(s) and link operations
- create Parts (mandatory workflow_id)
- create a Product and attach Parts
- create Machines with capacity (option C) and link operations
- create simulation order -> creates jobs
- machine view returns queues
- start job on a machine within capacity
- finish job steps until done
- completed parts increment final Market's MPQ quantity

Run:
  python smoke_test_simulation.py
"""

from __future__ import annotations

from main import app


def _print(title: str, resp):
    try:
        payload = resp.get_json()
    except Exception:
        payload = None
    print(f"{title}: {resp.status_code} {payload}")


def main() -> None:
    with app.app_context():
        c = app.test_client()

        # Operations
        op_a = c.post("/operations", json={"name": "Cut", "duration": 10})
        op_b = c.post("/operations", json={"name": "Drill", "duration": 20})
        _print("create op_a", op_a)
        _print("create op_b", op_b)
        op_a_id = op_a.get_json()["id"]
        op_b_id = op_b.get_json()["id"]

        # Workflow
        wf = c.post("/workflows", json={})
        _print("create workflow", wf)
        wf_id = wf.get_json()["id"]

        # Sequence is optional; if omitted, route appends to the end (0, then 1, ...)
        link1 = c.post(f"/workflows/{wf_id}/operations", json={"operation_id": op_a_id})
        link2 = c.post(f"/workflows/{wf_id}/operations", json={"operation_id": op_b_id})
        _print("link op_a->workflow", link1)
        _print("link op_b->workflow", link2)

        # Part
        part = c.post("/parts", json={"name": "WidgetPart", "workflow_id": wf_id})
        _print("create part", part)
        part_id = part.get_json()["id"]

        # Product and attach part
        prod = c.post("/products", json={"name": "Widget"})
        _print("create product", prod)
        prod_id = prod.get_json()["id"]

        attach = c.post(f"/products/{prod_id}/parts", json={"part_id": part_id})
        _print("attach part->product", attach)

        # Machines
        m1 = c.post("/machines", json={"name": "M1", "capacity": 2})
        m2 = c.post("/machines", json={"name": "M2", "capacity": 1})
        _print("create machine m1", m1)
        _print("create machine m2", m2)
        m1_id = m1.get_json()["id"]
        m2_id = m2.get_json()["id"]

        # Link operations
        _print("m1 add op_a", c.post(f"/machines/{m1_id}/operations", json={"operation_id": op_a_id}))
        _print("m1 add op_b", c.post(f"/machines/{m1_id}/operations", json={"operation_id": op_b_id}))
        _print("m2 add op_a", c.post(f"/machines/{m2_id}/operations", json={"operation_id": op_a_id}))

        # Create simulation order: 2 units -> 2 jobs for the single part
        order = c.post("/simulation/orders", json={"items": [{"product_id": prod_id, "quantity": 2}]})
        _print("create simulation order", order)
        order_id = order.get_json()["id"]

        # View machine queues
        view1 = c.get(f"/simulation/orders/{order_id}/machines")
        _print("machine view", view1)

        # Start 2 jobs on M1 (capacity 2)
        start1 = c.post(f"/simulation/orders/{order_id}/machines/{m1_id}/start", json={})
        start2 = c.post(f"/simulation/orders/{order_id}/machines/{m1_id}/start", json={})
        _print("start job 1 on m1", start1)
        _print("start job 2 on m1", start2)

        # Third start should fail due to capacity
        start3 = c.post(f"/simulation/orders/{order_id}/machines/{m1_id}/start", json={})
        _print("start job 3 on m1 (expect 409)", start3)

        # Finish both jobs step by step (2 operations -> need 2 finishes per job)
        j1 = start1.get_json()["job"]["id"]
        j2 = start2.get_json()["job"]["id"]

        _print("finish j1 step1", c.post(f"/simulation/orders/{order_id}/jobs/{j1}/finish", json={}))
        _print("finish j2 step1", c.post(f"/simulation/orders/{order_id}/jobs/{j2}/finish", json={}))

        # Now queue has step2 requiring op_b; start on M1 and finish
        _print("start j1 again", c.post(f"/simulation/orders/{order_id}/machines/{m1_id}/start", json={"job_id": j1}))
        _print("start j2 again", c.post(f"/simulation/orders/{order_id}/machines/{m1_id}/start", json={"job_id": j2}))

        _print("finish j1 step2(done)", c.post(f"/simulation/orders/{order_id}/jobs/{j1}/finish", json={}))
        _print("finish j2 step2(done)", c.post(f"/simulation/orders/{order_id}/jobs/{j2}/finish", json={}))

        # MPQ should now include part quantity +2 in the final market
        mpqs = c.get("/market-part-quantities")
        _print("mpqs", mpqs)


if __name__ == "__main__":
    main()
