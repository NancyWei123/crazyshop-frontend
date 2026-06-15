import { useEffect, useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Row,
  Col,
  Button,
  Spin,
  Empty,
  message,
  Badge,
  Space,
  Tag,
} from "antd";
import {
  ShoppingCartOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import { getAllProducts } from "../api/product";
import { addToCart } from "../api/cart";
import { useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function handleAddToCart(productId) {
    try {
      await addToCart(productId, 1);
      message.success("Added to cart successfully!");
    } catch (error) {
      console.error("Failed to add cart:", error);
      message.error("Failed to add to cart");
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getAllProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load products:", error);
        message.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        style={{
          background: "#ffffff",
          padding: "0 32px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Space size={12}>
          <ShoppingOutlined style={{ fontSize: 28, color: "#1677ff" }} />
          <Title level={3} style={{ margin: 0 }}>
            CrazyShop
          </Title>
        </Space>
        
        <Space size="middle">
          <Link to="/shop">
            <Button icon={<ShoppingOutlined />}>My Shop</Button>
          </Link>
          <Link to="/cart">
            <Button icon={<ShoppingCartOutlined />}>Cart</Button>
          </Link>
          <Link to="/order">
            <Button type="primary">Orders</Button>
          </Link>
        </Space>
      </Header>

      <Content style={{ padding: "32px" }}>
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              marginBottom: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 16,
            }}
          >
            <div>
              <Space size={10}>
                <AppstoreOutlined style={{ fontSize: 24, color: "#1677ff" }} />
                <Title level={2} style={{ margin: 0 }}>
                  All Products
                </Title>
              </Space>

              <Text type="secondary">
                Choose your favourite products and add them to cart.
              </Text>
            </div>

            <Tag color="blue">{products.length} products</Tag>
          </div>

          {loading ? (
            <div
              style={{
                height: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin size="large" tip="Loading products..." />
            </div>
          ) : products.length === 0 ? (
            <Card>
              <Empty description="No products found" />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;

                return (
                  <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
                    <Badge.Ribbon
                      text={isOutOfStock ? "Out of Stock" : "Available"}
                      color={isOutOfStock ? "red" : "green"}
                    >
                      <Card
                        hoverable
                        onClick={() => navigate(`/products/${product.id}`)}
                        style={{
                          borderRadius: 16,
                          overflow: "hidden",
                          height: "100%",
                        }}
                        cover={
                          <img
                            src={
                              product.imageUrl ||
                              product.image_url ||
                              "https://via.placeholder.com/600x400?text=Product"
                            }
                            alt={product.name}
                            style={{
                              height: 210,
                              width: "100%",
                              objectFit: "cover",
                            }}
                          />
                        }
                        bodyStyle={{ padding: 18 }}
                      >
                        <Title level={4} style={{ marginBottom: 6 }}>
                          {product.name}
                        </Title>

                        <Text type="secondary">
                          Shop: {product.shopName || "CrazyShop Official"}
                        </Text>

                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ marginTop: 10, minHeight: 44 }}
                        >
                          {product.description || "No description provided."}
                        </Paragraph>

                        <Space
                          direction="vertical"
                          size={10}
                          style={{ width: "100%" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text strong style={{ fontSize: 22, color: "#cf1322" }}>
                              ${Number(product.price).toFixed(2)}
                            </Text>

                            <Text type="secondary">Stock: {product.stock}</Text>
                          </div>

                          <Button
                            type="primary"
                            size="large"
                            block
                            icon={<ShoppingCartOutlined />}
                            disabled={isOutOfStock}
                            onClick={() => handleAddToCart(product.id)}
                          >
                            Add to Cart
                          </Button>
                        </Space>
                      </Card>
                    </Badge.Ribbon>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default Dashboard;