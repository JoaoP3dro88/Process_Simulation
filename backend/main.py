from flask import Flask
from config import app
from routes.operator_routes import operator_bp
from routes.product_routes import product_bp
from routes.part_routes import part_bp
from routes.market_routes import market_bp
from routes.machine_routes import machine_bp
from routes.operation_routes import operation_bp
from routes.process_routes import process_bp
from routes.workflow_routes import workflow_bp
from routes.workstation_routes import workstation_bp
from routes.market_part_quantity_routes import mpq_bp

# Registra todos os blueprints
app.register_blueprint(operator_bp)
app.register_blueprint(product_bp)
app.register_blueprint(part_bp)
app.register_blueprint(market_bp)
app.register_blueprint(machine_bp)
app.register_blueprint(operation_bp)
app.register_blueprint(process_bp)
app.register_blueprint(workflow_bp)
app.register_blueprint(workstation_bp)
app.register_blueprint(mpq_bp)

if __name__ == "__main__":
    app.run(debug=True)