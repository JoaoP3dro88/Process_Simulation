from flask import Blueprint, request, jsonify
from models.product import Product
from models.part import Part
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


# POST /products/<id>/parts - Adicionar part ao produto
@product_bp.route('/products/<int:id>/parts', methods=['POST'])
def add_part_to_product(id):
    product = Product.query.get_or_404(id)
    data = request.json or {}
    if 'part_id' not in data:
        return jsonify({"error": "Field 'part_id' is required"}), 400

    part = Part.query.get_or_404(data['part_id'])
    if part in product.parts:
        return jsonify({"message": "Part already exists in product"}), 400

    product.parts.append(part)
    db.session.commit()
    return jsonify(product.to_json())


# DELETE /products/<id>/parts/<part_id> - Remover part do produto
@product_bp.route('/products/<int:id>/parts/<int:part_id>', methods=['DELETE'])
def remove_part_from_product(id, part_id):
    product = Product.query.get_or_404(id)
    part = Part.query.get_or_404(part_id)

    if part not in product.parts:
        return jsonify({"message": "Part not found in product"}), 404

    product.parts.remove(part)
    db.session.commit()
    return jsonify(product.to_json())