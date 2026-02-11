from flask import Blueprint, request, jsonify
from models.product import Product
from config import db

product_bp = Blueprint('product_bp', __name__)

# GET /products - Listar todos os produtos
@product_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_json() for p in products])

# GET /products/<id> - Buscar produto específico
@product_bp.route('/products/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.to_json())

# POST /products - Criar produto
@product_bp.route('/products', methods=['POST'])
def create_product():
    data = request.json
    product = Product(name=data['name'])
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_json()), 201

# PUT /products/<id> - Atualizar produto
@product_bp.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    product = Product.query.get_or_404(id)
    data = request.json
    product.name = data.get('name', product.name)
    db.session.commit()
    return jsonify(product.to_json())

# DELETE /products/<id> - Deletar produto
@product_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    product = Product.query.get_or_404(id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"})

# GET /products/<id>/parts - Listar partes do produto
@product_bp.route('/products/<int:id>/parts', methods=['GET'])
def get_product_parts(id):
    product = Product.query.get_or_404(id)
    return jsonify([part.to_json() for part in product.parts])