import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyShop, getProductsInShopById } from "../api/shop";

import {
  Layout,
  Typography,
  Card,
  Button,
  Empty,
  message,
  Space,
  Row,
  Col,
  Badge,
  Spin,
} from "antd";

import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function Shop() {
  const [products, setProducts] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadShopAndProducts() {
      try {
        setLoading(true);
        const shopData = await getMyShop();
        setShop(shopData);
        const productsData = await getProductsInShopById(shopData.id);
        const productList = Array.isArray(productsData)
          ? productsData
          : productsData?.data || [];

        setProducts(productList);
      } catch (err) {
        console.error("Error fetching shop/products:", err);
        message.error(err.message || "Failed to load shop");
      } finally {
        setLoading(false);
      }
    }

    loadShopAndProducts();
  }, []);

  if (loading) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
        <Content
          style={{
            padding: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Empty
            description="You don't have a shop yet"
          >
            <Button type="primary" onClick={() => navigate("/shops/create")}>
              Create Shop
            </Button>
          </Empty>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Header
        style={{
          height: 72,
          padding: "0 32px",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Space size={14}>
          {shop.logoUrl ? (
            <img
              alt="shop logo"
              src={shop.logoUrl}
              style={{
                width: 48,
                height: 48,
                objectFit: "cover",
                borderRadius: 12,
              }}
            />
          ) : (
            <ShoppingOutlined style={{ fontSize: 32, color: "#1677ff" }} />
          )}

          <div>
            <Title level={3} style={{ margin: 0 }}>
              {shop.name || "My Shop"}
            </Title>
            <Text type="secondary">{shop.description || "Shop dashboard"}</Text>
          </div>
        </Space>

        <Space>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />}>Back to Products</Button>
          </Link>

          <Link to="/manage-shop">
            <Button type="primary" icon={<SettingOutlined />}>
              Manage Shop
            </Button>
          </Link>
        </Space>
      </Header>

      <Content style={{ padding: 32 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            Products in this shop
          </Title>
          <Text type="secondary">
            Total products: {products.length}
          </Text>
        </div>

        {products.length === 0 ? (
          <Empty description="No products in this shop yet">
            <Button type="primary" onClick={() => navigate("/products/create")}>
              Create Product
            </Button>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {products.map((product) => {
              const isOutOfStock = Number(product.stock) <= 0;

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
                      styles={{
                        body: { padding: 18 },
                      }}
                    >
                      <Title level={4} style={{ marginBottom: 6 }}>
                        {product.name}
                      </Title>

                      <Text type="secondary">
                        Shop: {shop.name || "My Shop"}
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
                            ${Number(product.price || 0).toFixed(2)}
                          </Text>

                          <Text type="secondary">
                            Stock: {product.stock}
                          </Text>
                        </div>

                        <Button
                          type="primary"
                          size="large"
                          block
                          icon={<ShoppingCartOutlined />}
                          disabled={isOutOfStock}
                          onClick={(e) => {
                            e.stopPropagation();
                            message.info("Add to cart function not added yet");
                          }}
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
      </Content>
    </Layout>
  );
}

export default Shop;