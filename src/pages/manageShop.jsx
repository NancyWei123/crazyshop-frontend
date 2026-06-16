import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Typography,
  Card,
  Form,
  Input,
  Button,
  message,
  Spin,
  Empty,
  Tabs,
  Table,
  Space,
  Image,
  Tag,
  Row,
  Col,
} from "antd";

import {
  ShopOutlined,
  SaveOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

import {
  getMyShop,
  getProductsInShopById,
  updateShop,
} from "../api/shop";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function ManageShopPage() {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  useEffect(() => {
  let cancelled = false;

  async function loadShopAndProducts() {
    try {
      const shopData = await getMyShop();

      if (cancelled) return;

      setShop(shopData);

      form.setFieldsValue({
        name: shopData.name,
        description: shopData.description,
        logoUrl: shopData.logoUrl,
      });

      const productData = await getProductsInShopById(shopData.id);

      if (cancelled) return;

      setProducts(
        Array.isArray(productData)
          ? productData
          : productData?.data || []
      );
    } catch (err) {
      if (cancelled) return;

      console.error("Failed to load shop:", err);
      message.error(err.message || "Failed to load shop");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadShopAndProducts();

  return () => {
    cancelled = true;
  };
}, [form]);

  async function handleUpdateShop(values) {
    try {
      setSaving(true);

      const updatedShop = await updateShop({
        id: shop.id,
        name: values.name,
        description: values.description,
        logoUrl: values.logoUrl,
      });

      setShop(updatedShop);
      message.success("Shop updated successfully");
    } catch (err) {
      console.error("Failed to update shop:", err);
      message.error(err.message || "Failed to update shop");
    } finally {
      setSaving(false);
    }
  }

  const productColumns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        <Image
          src={imageUrl || "https://via.placeholder.com/100x80?text=Product"}
          width={80}
          height={60}
          style={{ objectFit: "cover", borderRadius: 8 }}
        />
      ),
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${Number(price || 0).toFixed(2)}`,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock) => (
        <Tag color={stock > 0 ? "green" : "red"}>
          {stock > 0 ? `Stock: ${stock}` : "Out of Stock"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "ON_SALE" ? "blue" : "default"}>
          {status || "UNKNOWN"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, product) => (
        <Space>
          <Button onClick={() => navigate(`/products/${product.id}`)}>
            View
          </Button>
          <Button onClick={() => navigate(`/products/${product.id}/edit`)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <Layout
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5f7fb",
        }}
      >
        <Spin size="large" />
      </Layout>
    );
  }

  if (!shop) {
    return (
      <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
        <Content style={{ padding: 32 }}>
          <Empty description="You don't have a shop yet">
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
      <Content style={{ padding: 32 }}>
        <Card
          style={{
            borderRadius: 18,
            marginBottom: 24,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col>
              <Space size={16}>
                <ShopOutlined style={{ fontSize: 36, color: "#1677ff" }} />
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    Manage Your Shop
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#666" }}>
                    Here you can manage your shop details, products, and orders.
                  </Paragraph>
                </div>
              </Space>
            </Col>

            <Col>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/shop")}>
                Back to Shop
              </Button>
            </Col>
          </Row>
        </Card>

        <Tabs
          defaultActiveKey="details"
          items={[
            {
              key: "details",
              label: "Shop Details",
              children: (
                <Card title="Shop Details" style={{ borderRadius: 16 }}>
                  <Space align="start" size={24} style={{ marginBottom: 24 }}>
                    <Image
                      src={
                        shop.logoUrl ||
                        "https://via.placeholder.com/200x160?text=Shop"
                      }
                      width={160}
                      height={120}
                      style={{ objectFit: "cover", borderRadius: 12 }}
                    />

                    <div>
                      <Title level={4}>{shop.name}</Title>
                      <Text type="secondary">
                        Status:{" "}
                        <Tag color={shop.status === "ACTIVE" ? "green" : "orange"}>
                          {shop.status || "PENDING"}
                        </Tag>
                      </Text>
                    </div>
                  </Space>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateShop}
                  >
                    <Form.Item
                      label="Shop Name"
                      name="name"
                      rules={[
                        { required: true, message: "Please input shop name" },
                      ]}
                    >
                      <Input placeholder="Enter shop name" />
                    </Form.Item>

                    <Form.Item label="Description" name="description">
                      <Input.TextArea
                        rows={4}
                        placeholder="Enter shop description"
                      />
                    </Form.Item>

                    <Form.Item label="Logo URL" name="logoUrl">
                      <Input placeholder="https://example.com/logo.png" />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={saving}
                    >
                      Save Changes
                    </Button>
                  </Form>
                </Card>
              ),
            },
            {
              key: "products",
              label: "Products",
              children: (
                <Card
                  title="Products"
                  style={{ borderRadius: 16 }}
                  extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => navigate("/products/create")}
                    >
                      Create Product
                    </Button>
                  }
                >
                  <Table
                    rowKey="id"
                    columns={productColumns}
                    dataSource={products}
                    pagination={{ pageSize: 5 }}
                  />
                </Card>
              ),
            },
            {
              key: "orders",
              label: "Orders",
              children: (
                <Card title="Shop Orders" style={{ borderRadius: 16 }}>
                  <Empty description="Shop order management is not added yet" />
                </Card>
              ),
            },
          ]}
        />
      </Content>
    </Layout>
  );
}

export default ManageShopPage;