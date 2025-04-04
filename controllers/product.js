const { v4: uuidv4 } = require("uuid");
const Product = require("../models/Product");

exports.getAllProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      const mappedProducts = products.map((product) => {
        if (product.imageUrl && !product.imageUrl.startsWith("http")) {
          product.imageUrl = `${req.protocol}://${req.get("host")}/images/${
            product.imageUrl
          }`;
        }
        return product;
      });
      res.status(200).json(mappedProducts);
    })
    .catch(() => {
      res.status(500).json({ error: "Database error!" });
    });
};

exports.getOneProduct = (req, res, next) => {
  Product.findById(req.params.id)
    .then((product) => {
      if (!product) {
        return res.status(404).json({ error: "Product not found!" });
      }
      if (product.imageUrl && !product.imageUrl.startsWith("http")) {
        product.imageUrl = `${req.protocol}://${req.get("host")}/images/${
          product.imageUrl
        }`;
      }
      res.status(200).json(product);
    })
    .catch(() => {
      res.status(500).json({ error: "Database error!" });
    });
};

exports.orderProducts = (req, res, next) => {
  const { contact, products } = req.body;

  if (
    !contact ||
    !contact.firstName ||
    !contact.lastName ||
    !contact.address ||
    !contact.city ||
    !contact.email ||
    !products
  ) {
    return res.status(400).json({ error: "Bad request!" });
  }

  let queries = products.map((productId) =>
    Product.findById(productId).then((product) => {
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }
      if (product.imageUrl && !product.imageUrl.startsWith("http")) {
        product.imageUrl = `${req.protocol}://${req.get("host")}/images/${
          product.imageUrl
        }`;
      }
      return product;
    })
  );

  Promise.all(queries)
    .then((products) => {
      const orderId = uuidv4();
      res.status(201).json({
        contact,
        products,
        orderId,
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};
