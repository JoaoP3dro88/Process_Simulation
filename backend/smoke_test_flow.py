"""Quick smoke test for the desired CRUD flow.

Flow:
  1) Create Operation (name, duration)
  2) Create Workflow (name)
  3) Attach operation to workflow
  4) Create Part (name, workflow_id)  [1:1 workflow<->part]
  5) Create Product (name)
  6) Attach part to product; then detach

Run:
  python smoke_test_flow.py

It uses Flask's test_client, so you don't need to start the server.
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

        # 1) Operation
        op_resp = c.post("/operations", json={"name": "Cut", "duration": 1.5})
        _print("create operation", op_resp)

        # 2) Workflow
        wf_resp = c.post("/workflows", json={})
        _print("create workflow", wf_resp)
        wf_id = wf_resp.get_json()["id"]

        # 3) Link operation to workflow
        op_id = op_resp.get_json()["id"]
        link_resp = c.post(f"/workflows/{wf_id}/operations", json={"operation_id": op_id})
        _print("link operation->workflow", link_resp)

        link_dup = c.post(f"/workflows/{wf_id}/operations", json={"operation_id": op_id})
        _print("link dup operation->workflow", link_dup)

        # 4) Part with mandatory workflow_id (1:1)
        part_resp = c.post("/parts", json={"name": "PartA", "workflow_id": wf_id})
        _print("create part", part_resp)
        part_id = part_resp.get_json()["id"]

        # 5) Product
        prod_resp = c.post("/products", json={"name": "Prod1"})
        _print("create product", prod_resp)
        prod_id = prod_resp.get_json()["id"]

        # 6) Attach part to product
        attach_resp = c.post(f"/products/{prod_id}/parts", json={"part_id": part_id})
        _print("attach part->product", attach_resp)

        # Detach
        detach_resp = c.delete(f"/products/{prod_id}/parts/{part_id}")
        _print("detach part<-product", detach_resp)


if __name__ == "__main__":
    main()
