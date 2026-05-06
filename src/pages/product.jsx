// src/pages/product.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Image,
  InputNumber,
  List,
  message,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import {addToCart} from "../api/cart";
import { getProductById } from "../api/product";

const { Title, Text, Paragraph } = Typography;

export default function Product() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const data = await getProductById(productId);
        setProduct(data);
      } catch (error) {
        message.error(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  async function handleAddToCart() {
    const token = localStorage.getItem("token");

    if (!token) {
      message.warning("Please login first");
      navigate("/login");
      return;
    }

    if (!product) {
      message.warning("Product not loaded");
      return;
    }

    const stock = product.stock ?? 0;

    if (stock <= 0) {
      message.warning("This product is out of stock");
      return;
    }
    try {
      setAdding(true);
      await addToCart(productId, quantity);
      message.success("Added to cart successfully!");
    } catch (error) {
      console.error("Failed to add cart:", error);
      message.error("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={styles.center}>
        <Text type="secondary">Product not found</Text>
      </div>
    );
  }

  const id = product.id || product.productId;
  const name = product.name || product.productName || "Unknown Product";
  const description = product.description || "No short description.";
  const longDescription =
    product.longDescription || "No long description available.";
  const price = product.price ?? 0;
  const stock = product.stock ?? 0;
  const shopName = product.shopName || product.storeName || "CrazyShop";

  const image =
    product.image ||
    product.imageUrl ||
    product.productImage ||
    product.coverImage ||
    product.gallery?.[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900";

  const gallery = product.gallery || [];
  const attributes = product.attributes || [];
  const specifications = product.specifications || {};

  return (
    <div style={styles.page}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={styles.backButton}
      >
        Back
      </Button>

      <Card style={styles.mainCard} styles={{ body: { padding: 0 } }}>
        <Row gutter={0}>
          <Col xs={24} md={12}>
            <div style={styles.imageSection}>
              <Image
                src={image}
                alt={name}
                width="100%"
                height={430}
                style={styles.mainImage}
                preview
              />

              {gallery.length > 0 && (
                <div style={styles.galleryRow}>
                  {gallery.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      alt={`${name}-${index}`}
                      width={82}
                      height={82}
                      style={styles.galleryImage}
                      preview
                    />
                  ))}
                </div>
              )}
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={styles.infoSection}>
              <Tag color="blue" icon={<ShopOutlined />}>
                {shopName}
              </Tag>

              <Title level={2} style={styles.title}>
                {name}
              </Title>

              <Text type="secondary">Product ID: {id}</Text>

              <div style={styles.price}>${Number(price).toFixed(2)}</div>

              <div style={styles.stockArea}>
                {stock > 0 ? (
                  <Tag color="green">In stock: {stock}</Tag>
                ) : (
                  <Tag color="red">Out of stock</Tag>
                )}
              </div>

              <Divider />

              <Paragraph style={styles.shortDescription}>
                {description}
              </Paragraph>

              <div style={styles.quantityRow}>
                <Text strong>Quantity</Text>

                <InputNumber
                  min={1}
                  max={stock > 0 ? stock : 1}
                  value={quantity}
                  disabled={stock <= 0}
                  onChange={(value) => setQuantity(value || 1)}
                />
              </div>

              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                loading={adding}
                disabled={stock <= 0}
                onClick={handleAddToCart}
                style={styles.addButton}
              >
                Add to Cart
              </Button>

              <Button
                size="large"
                onClick={() => navigate("/cart")}
                style={styles.cartButton}
              >
                Go to Cart
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="Product Description" style={styles.detailCard}>
        <Paragraph style={styles.longDescription}>
          {longDescription}
        </Paragraph>
      </Card>

      <Card title="Attributes" style={styles.detailCard}>
        {attributes.length > 0 ? (
          <List
            grid={{
              gutter: 16,
              xs: 1,
              sm: 2,
              md: 3,
              lg: 3,
            }}
            dataSource={attributes}
            renderItem={(item) => (
              <List.Item>
                <Card size="small" style={styles.smallCard}>
                  <Text type="secondary">{item.name}</Text>
                  <br />
                  <Text strong>{item.value}</Text>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">No attributes available.</Text>
        )}
      </Card>

      <Card title="Specifications" style={styles.detailCard}>
        {Object.keys(specifications).length > 0 ? (
          <Descriptions bordered column={1}>
            {Object.entries(specifications).map(([key, value]) => (
              <Descriptions.Item label={formatLabel(key)} key={key}>
                {String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : (
          <Text type="secondary">No specifications available.</Text>
        )}
      </Card>
    </div>
  );
}

function formatLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb 0%, #eef3ff 100%)",
    padding: "32px",
  },
  backButton: {
    marginBottom: "20px",
    borderRadius: "10px",
  },
  mainCard: {
    maxWidth: "1150px",
    margin: "0 auto 24px",
    borderRadius: "22px",
    overflow: "hidden",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.10)",
  },
  imageSection: {
    background: "#ffffff",
    padding: "36px",
    minHeight: "560px",
  },
  mainImage: {
    objectFit: "cover",
    borderRadius: "18px",
  },
  galleryRow: {
    display: "flex",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  galleryImage: {
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  infoSection: {
    padding: "46px",
    background: "#ffffff",
    minHeight: "560px",
  },
  title: {
    marginTop: "18px",
    marginBottom: "6px",
  },
  price: {
    marginTop: "22px",
    fontSize: "36px",
    fontWeight: 800,
    color: "#1677ff",
  },
  stockArea: {
    marginTop: "14px",
  },
  shortDescription: {
    fontSize: "16px",
    lineHeight: 1.8,
    color: "#4b5563",
  },
  quantityRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "24px",
    marginBottom: "24px",
  },
  addButton: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    fontWeight: 700,
    marginBottom: "12px",
  },
  cartButton: {
    width: "100%",
    height: "48px",
    borderRadius: "12px",
    fontWeight: 600,
  },
  detailCard: {
    maxWidth: "1150px",
    margin: "0 auto 24px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  },
  longDescription: {
    fontSize: "16px",
    lineHeight: 1.9,
    color: "#374151",
  },
  smallCard: {
    borderRadius: "14px",
    background: "#fafafa",
  },
  center: {
    minHeight: "75vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};