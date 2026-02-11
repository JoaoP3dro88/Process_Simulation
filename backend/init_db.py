from config import app, db

# Importa os models para o SQLAlchemy "conhecer" todas as tabelas
from models.operator import Operator  # noqa: F401
from models.operation import Operation  # noqa: F401
from models.workflow import Workflow  # noqa: F401
from models.part import Part  # noqa: F401
from models.process import Process  # noqa: F401
from models.workstation import Workstation  # noqa: F401
from models.machine import Machine  # noqa: F401
from models.product import Product  # noqa: F401
from models.market import Market  # noqa: F401
from models.market_part_quantity import MarketPartQuantity  # noqa: F401

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        print("Banco e tabelas criados com sucesso.")