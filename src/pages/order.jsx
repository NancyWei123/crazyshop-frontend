import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyOrders,cancelOrder } from "../api/order";

import {
  Layout,
  Typography,
  Card,
  Button,
  Empty,
  message,
  Space,
  Tag,
  Modal,
  Table,
  Descriptions,
  List,
  Divider,
  Spin,
} from "antd";

import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function Order() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);

        const data = await getMyOrders();
        console.log("Fetched orders:", data);

        const orderList = Array.isArray(data)
          ? data
          : data?.orders || data?.data || [];

        setOrders(orderList);
      } catch (error) {
        console.error("Failed to load orders:", error);
        message.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const getOrderItems = (order) => {
    return order?.orderItems || order?.items || order?.products || [];
  };
  const getCreateAt = (order) => {
    return order?.createdAt || order?.createTime || order?.createdDate || "Unknown";
  };
  const getProductName = (item) => {
    return (
      item.productName ||
      item.name ||
      item.product?.name ||
      `Product #${item.productId || "Unknown"}`
    );
  };

  const getTotalPrice = (order) => {
    return Number(order?.totalPrice ?? order?.totalAmount ?? 0);
  };

  const getItemPrice = (item) => {
    return Number(item.price ?? item.unitPrice ?? item.productPrice ?? 0);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      CREATED: "default",
      PENDING_PAYMENT: "orange",
      PAID: "green",
      PROCESSING: "blue",
      SHIPPED: "purple",
      COMPLETED: "green",
      CANCELLED: "red",
      REFUNDED: "magenta",
    };

    return statusMap[status] || "default";
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Created At",
      key: "createdAt",
      render: (_, order) => {
        return <Text>{getCreateAt(order)}</Text>;
      },
    },
    {
      title: "Total Price",
      key: "totalPrice",
      render: (_, order) => (
        <Text strong style={{ color: "#1677ff" }}>
          ${getTotalPrice(order).toFixed(2)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status || "UNKNOWN"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, order) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(order);
            setDetailOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const selectedItems = getOrderItems(selectedOrder);

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
          <ShoppingOutlined style={{ fontSize: 28, color: "#1677ff" }} />
          <Title level={3} style={{ margin: 0 }}>
            Order
          </Title>
        </Space>

        <Space>
          <Link to="/">
            <Button icon={<ArrowLeftOutlined />}>
              Back to Products
            </Button>
          </Link>

          <Link to="/cart">
            <Button type="primary" icon={<ShoppingCartOutlined />}>
              Cart
            </Button>
          </Link>
        </Space>
      </Header>

      <Content style={{ padding: "32px" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: 18,
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <Space
            direction="vertical"
            size={24}
            style={{ width: "100%" }}
          >
            <div>
              <Title level={2} style={{ marginBottom: 4 }}>
                My Orders
              </Title>

              <Text type="secondary">
                View your order history and check order details.
              </Text>
            </div>

            <Spin spinning={loading}>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={orders}
                pagination={{
                  pageSize: 6,
                  showSizeChanger: false,
                }}
                locale={{
                  emptyText: (
                    <Empty description="No orders found" />
                  ),
                }}
              />
            </Spin>
          </Space>
        </Card>
      </Content>

      <Modal
        title="Order Details"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        width={720}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>
            Close
          </Button>,
          selectedOrder?.status === "PENDING_PAYMENT" && (
            <Button key="cancel" type="primary" danger
              onClick={async () => {
                const response = await cancelOrder(selectedOrder.id);
                if(response.status === 200){
                  message.success("Order cancelled successfully");
                  setDetailOpen(false);
                  // Refresh orders after cancellation
                  getMyOrders().then((data) => {
                    const orderList = Array.isArray(data)
                      ? data
                      : data?.orders || data?.data || [];
                    setOrders(orderList);
                  }).catch((error) => {
                    console.error("Failed to refresh orders:", error);
                    message.error("Failed to refresh orders");
                  });
                }
              }}>
              Cancel Order
            </Button>
          ),
        ]}
      >
        {selectedOrder && (
          <Space direction="vertical" size={20} style={{ width: "100%" }}>
            <Descriptions
              bordered
              column={1}
              size="middle"
            >
              <Descriptions.Item label="Order ID">
                #{selectedOrder.id}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status || "UNKNOWN"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Total Price">
                <Text strong style={{ color: "#1677ff" }}>
                  ${getTotalPrice(selectedOrder).toFixed(2)}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Products</Divider>

            {selectedItems.length > 0 ? (
              <List
                bordered
                dataSource={selectedItems}
                renderItem={(item, index) => {
                  const quantity = item.quantity || 1;
                  const price = getItemPrice(item);
                  const subtotal = price * quantity;

                  return (
                    <List.Item>
                      <div style={{ width: "100%" }}>
                        <Space
                          style={{
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <Text strong>
                              {index + 1}. {getProductName(item)}
                            </Text>

                            <br />

                            <Text type="secondary">
                              Quantity: {quantity}
                            </Text>
                          </div>
                          <div>
                            <Button href={`/products/${item.productId}`} icon={<QuestionCircleOutlined />}>
                              View Details
                            </Button>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <Text>
                              Unit Price: ${price.toFixed(2)}
                            </Text>

                            <br />

                            <Text strong>
                              Subtotal: ${subtotal.toFixed(2)}
                            </Text>
                          </div>
                        </Space>
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="No product details" />
            )}
          </Space>
        )}
      </Modal>
    </Layout>
  );
}

export default Order;