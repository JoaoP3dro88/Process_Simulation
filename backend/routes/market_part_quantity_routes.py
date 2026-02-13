from flask import Blueprint, request, jsonify
from models.market_part_quantity import MarketPartQuantity
from config import db

mpq_bp = Blueprint('mpq_bp', __name__)

@mpq_bp.route('/market-part-quantities', methods=['GET'])
def get_mpqs():
    mpqs = MarketPartQuantity.query.all()
    return jsonify([mpq.to_json() for mpq in mpqs])

@mpq_bp.route('/market-part-quantities', methods=['POST'])
def create_mpq():
    data = request.json or {}
    if 'market_id' not in data or 'part_id' not in data or 'quantity' not in data:
        return jsonify({"error": "Fields 'market_id', 'part_id', and 'quantity' are required"}), 400

    market_id = data['market_id']
    part_id = data['part_id']
    quantity = data['quantity']

    mpq = MarketPartQuantity.query.get((market_id, part_id))
    if mpq:
        mpq.quantity = quantity
        db.session.commit()
        return jsonify(mpq.to_json()), 200

    mpq = MarketPartQuantity(market_id=market_id, part_id=part_id, quantity=quantity)
    db.session.add(mpq)
    db.session.commit()
    return jsonify(mpq.to_json()), 201