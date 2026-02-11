from flask import Blueprint, request, jsonify
from models.market import Market
from config import db

market_bp = Blueprint('market_bp', __name__)

# GET /markets - Listar demandas de mercado
@market_bp.route('/markets', methods=['GET'])
def get_markets():
    markets = Market.query.all()
    return jsonify([m.to_json() for m in markets])

# GET /markets/<id> - Buscar demanda específica
@market_bp.route('/markets/<int:id>', methods=['GET'])
def get_market(id):
    market = Market.query.get_or_404(id)
    return jsonify(market.to_json())

# POST /markets - Criar demanda
@market_bp.route('/markets', methods=['POST'])
def create_market():
    data = request.json
    market = Market(
        last_process_id=data.get('last_process_id'),
        next_process_id=data.get('next_process_id')
    )
    db.session.add(market)
    db.session.commit()
    return jsonify(market.to_json()), 201

# PUT /markets/<id> - Atualizar demanda
@market_bp.route('/markets/<int:id>', methods=['PUT'])
def update_market(id):
    market = Market.query.get_or_404(id)
    data = request.json
    market.last_process_id = data.get('last_process_id', market.last_process_id)
    market.next_process_id = data.get('next_process_id', market.next_process_id)
    db.session.commit()
    return jsonify(market.to_json())

# DELETE /markets/<id> - Deletar demanda
@market_bp.route('/markets/<int:id>', methods=['DELETE'])
def delete_market(id):
    market = Market.query.get_or_404(id)
    db.session.delete(market)
    db.session.commit()
    return jsonify({"message": "Market deleted"})

# GET /markets/<id>/part-demands - Dicionário de demanda por parte
@market_bp.route('/markets/<int:id>/part-demands', methods=['GET'])
def get_market_part_demands(id):
    market = Market.query.get_or_404(id)
    # Supondo que market.parts seja uma lista de MarketPartQuantity
    return jsonify({mpq.part.id: mpq.quantity for mpq in market.parts})

@market_bp.route('/markets/<int:id>/last-process', methods=['PUT'])
def update_market_last_process(id):
    market = Market.query.get_or_404(id)
    data = request.json
    market.last_process_id = data['last_process_id']
    db.session.commit()
    return jsonify({"message": "last_process atualizado", "market": market.to_json()})

# PUT /markets/<id>/next-process - Atualizar next_process do market
@market_bp.route('/markets/<int:id>/next-process', methods=['PUT'])
def update_market_next_process(id):
    market = Market.query.get_or_404(id)
    data = request.json
    market.next_process_id = data['next_process_id']
    db.session.commit()
    return jsonify({"message": "next_process atualizado", "market": market.to_json()})