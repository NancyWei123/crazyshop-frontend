import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Typography,
  message,
  Spin,
  Space,
  Image,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import { getMyShop } from "../api/shop";
import { createProduct } from "../api/product";

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

function CreateProductPage() {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function loadMyShop() {
      try {
        const shopData = await getMyShop();

        if (cancelled) return;

        setShop(shopData);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load shop:", err);
        message.error(err.message || "You don't have a shop yet");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMyShop();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreateProduct(values) {
    if (!shop) {
      message.error("Shop not found");
      return;
    }

    try {
      setSubmitting(true);

      const requestData = {
        shopId: shop.id,
        name: values.name,
        imageUrl: values.imageUrl,
        price: values.price,
        stock: values.stock,
      };

      await createProduct(requestData);

      message.success("Product created successfully");
      navigate("/shop/manage");
    } catch (err) {
      console.error("Failed to create product:", err);
      message.error(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f7fb" }}>
      <Content style={{ padding: 32 }}>
        <Card
          style={{
            maxWidth: 760,
            margin: "0 auto",
            borderRadius: 18,
            boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
          }}
        >
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/shop/manage")}
                style={{ marginBottom: 16 }}
              >
                Back to Manage Shop
              </Button>

              <Space size={12}>
                <ShoppingOutlined style={{ fontSize: 32, color: "#1677ff" }} />
                <div>
                  <Title level={2} style={{ margin: 0 }}>
                    Create Product
                  </Title>
                  <Paragraph style={{ margin: 0, color: "#666" }}>
                    Add a new product to your shop.
                  </Paragraph>
                </div>
              </Space>
            </div>

            {shop && (
              <Card size="small" style={{ background: "#fafafa" }}>
                <Text strong>Current Shop: </Text>
                <Text>{shop.name}</Text>
              </Card>
            )}

            {imageUrl && (
              <Image
                src={imageUrl}
                width={220}
                height={160}
                style={{
                  objectFit: "cover",
                  borderRadius: 12,
                }}
                fallback="https://via.placeholder.com/600x400?text=Product"
              />
            )}

            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateProduct}
              initialValues={{
                stock: 0,
                price: 0,
              }}
            >
              <Form.Item
                label="Product Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please input product name",
                  },
                ]}
              >
                <Input placeholder="Enter product name" size="large" />
              </Form.Item>

              <Form.Item
                label="Image URL"
                name="imageUrl"
                rules={[
                  {
                    required: true,
                    message: "Please input image URL",
                  },
                ]}
              >
                <Input
                  placeholder="https://example.com/product.png"
                  size="large"
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Price"
                name="price"
                rules={[
                  {
                    required: true,
                    message: "Please input product price",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Enter price"
                />
              </Form.Item>

              <Form.Item
                label="Stock"
                name="stock"
                rules={[
                  {
                    required: true,
                    message: "Please input product stock",
                  },
                ]}
              >
                <InputNumber
                  min={0}
                  precision={0}
                  style={{ width: "100%" }}
                  size="large"
                  placeholder="Enter stock"
                />
              </Form.Item>

              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  loading={submitting}
                >
                  Create Product
                </Button>

                <Button onClick={() => navigate("/shop/manage")}>
                  Cancel
                </Button>
              </Space>
            </Form>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default CreateProductPage;