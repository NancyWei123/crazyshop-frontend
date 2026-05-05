import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Layout,
  Typography,
  Card,
  Button,
  Table,
  Image,
  InputNumber,
  Space,
  Empty,
  Spin,
  message,
  Popconfirm,
  Divider,
  Tag,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ClearOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../api/cart";

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMyCart();
      setCart(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
      message.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let ignore = false;

  async function loadCart() {
    try {
      setLoading(true);
      const data = await getMyCart();

      if (!ignore) {
        setCart(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!ignore) {
        setLoading(false);
      }
    }
  }

  loadCart();

  return () => {
    ignore = true;
  };
}, []);

  const items = useMemo(() => cart?.items || [], [cart]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);
  }, [items]);

  async function handleUpdateQuantity(cartItemId, quantity) {
    if (!quantity || quantity < 1) {
      return;
    }

    try {
      setUpdatingId(cartItemId);
      await updateCartItem(cartItemId, quantity);
      message.success("Cart updated");
      await loadCart();
    } catch (error) {
      console.error("Failed to update cart item:", error);
      message.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRemove(cartItemId) {
    try {
      setUpdatingId(cartItemId);
      await removeCartItem(cartItemId);
      message.success("Item removed");
      await loadCart();
    } catch (error) {
      console.error("Failed to remove item:", error);
      message.error("Failed to remove item");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleClearCart() {
    try {
      setClearing(true);
      await clearCart();
      message.success("Cart cleared");
      await loadCart();
    } catch (error) {
      console.error("Failed to clear cart:", error);
      message.error("Failed to clear cart");
    } finally {
      setClearing(false);
    }
  }

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <Space size={16} align="start">
          <Image
            src={
              record.productImage ||
              record.imageUrl ||
              "https://via.placeholder.com/160x120?text=Product"
            }
            alt={record.productName || "Product"}
            width={96}
            height={72}
            style={{
              objectFit: "cover",
              borderRadius: 12,
              border: "1px solid #f0f0f0",
            }}
            preview={false}
          />

          <div>
            <Text strong style={{ fontSize: 16 }}>
              {record.productName || "Unknown Product"}
            </Text>

            <Paragraph
              type="secondary"
              style={{ margin: "6px 0 0" }}
              ellipsis={{ rows: 1 }}
            >
              Product ID: {record.productId}
            </Paragraph>

            <Tag color="blue" style={{ marginTop: 6 }}>
              In Cart
            </Tag>
          </div>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (price) => (
        <Text strong style={{ color: "#cf1322", fontSize: 16 }}>
          ${Number(price || 0).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 150,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          value={quantity}
          disabled={updatingId === record.id}
          onChange={(value) => handleUpdateQuantity(record.id, value)}
          style={{ width: 96 }}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      width: 140,
      render: (_, record) => (
        <Text strong style={{ fontSize: 16 }}>
          $
          {(
            Number(record.price || 0) * Number(record.quantity || 0)
          ).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 130,
      render: (_, record) => (
        <Popconfirm
          title="Remove this item?"
          description="This product will be removed from your cart."
          okText="Remove"
          cancelText="Cancel"
          onConfirm={() => handleRemove(record.id)}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            loading={updatingId === record.id}
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

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
        <Space size={12}>
          <ShoppingCartOutlined style={{ fontSize: 28, color: "#1677ff" }} />
          <div>
            <Title level={3} style={{ margin: 0, lineHeight: 1.1 }}>
              My Cart
            </Title>
            <Text type="secondary">Review your selected products</Text>
          </div>
        </Space>

        <Space>
          <Link to="/products">
            <Button icon={<ArrowLeftOutlined />}>Back to Products</Button>
          </Link>

          <Link to="/orders">
            <Button type="primary">Orders</Button>
          </Link>
        </Space>
      </Header>

      <Content style={{ padding: 32 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {loading ? (
            <Card
              style={{
                borderRadius: 18,
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spin size="large" tip="Loading cart..." />
            </Card>
          ) : items.length === 0 ? (
            <Card
              style={{
                borderRadius: 18,
                minHeight: 420,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    Your cart is empty. Add some products to start shopping.
                  </span>
                }
              >
                <Link to="/products">
                  <Button type="primary" icon={<ShoppingOutlined />}>
                    Go Shopping
                  </Button>
                </Link>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={17}>
                <Card
                  title={
                    <Space>
                      <ShoppingOutlined />
                      <span>Cart Items</span>
                      <Tag color="blue">{items.length}</Tag>
                    </Space>
                  }
                  extra={
                    <Popconfirm
                      title="Clear cart?"
                      description="All products will be removed from your cart."
                      okText="Clear"
                      cancelText="Cancel"
                      onConfirm={handleClearCart}
                    >
                      <Button
                        danger
                        icon={<ClearOutlined />}
                        loading={clearing}
                      >
                        Clear Cart
                      </Button>
                    </Popconfirm>
                  }
                  style={{
                    borderRadius: 18,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={items}
                    pagination={false}
                    scroll={{ x: 760 }}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={7}>
                <Card
                  title="Order Summary"
                  style={{
                    borderRadius: 18,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                  }}
                >
                  <Space
                    direction="vertical"
                    size={16}
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Items</Text>
                      <Text strong>{totalQuantity}</Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text type="secondary">Product Types</Text>
                      <Text strong>{items.length}</Text>
                    </div>

                    <Divider style={{ margin: "8px 0" }} />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text strong style={{ fontSize: 18 }}>
                        Total
                      </Text>

                      <Title
                        level={2}
                        style={{
                          margin: 0,
                          color: "#cf1322",
                        }}
                      >
                        ${totalPrice.toFixed(2)}
                      </Title>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CreditCardOutlined />}
                    >
                      Checkout
                    </Button>

                    <Link to="/products">
                      <Button size="large" block>
                        Continue Shopping
                      </Button>
                    </Link>
                  </Space>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default CartPage;