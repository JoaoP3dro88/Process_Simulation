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
    data = request.json
    mpq = MarketPartQuantity(market_id=data['market_id'], part_id=data['part_id'], quantity=data['quantity'])
    db.session.add(mpq)
    db.session.commit()
    return jsonify(mpq.to_json()), 201