import { useMemo, useState } from "react";
import {
  Layout,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Space,
  Row,
  Col,
  Divider,
  message,
  Result,
} from "antd";
import {
  CreditCardOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function PaymentPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  const cardNumber = Form.useWatch("cardNumber", form);

  const formattedCardPreview = useMemo(() => {
    if (!cardNumber) return "•••• •••• •••• ••••";

    return cardNumber
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim()
      .padEnd(19, "•");
  }, [cardNumber]);

  function formatCardNumber(value) {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function formatExpiry(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 4);

    if (numbers.length <= 2) {
      return numbers;
    }

    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }

  async function handlePayment(values) {
    try {
      setPaying(true);

      const payload = {
        cardNumber: values.cardNumber.replace(/\s/g, ""),
        expiry: values.expiry,
        cvv: values.cvv,
        cardHolderName: values.cardHolderName,
      };

      console.log("Payment payload:", payload);

      // Later you can replace this with your real backend API:
      // await createPayment(payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success("Payment successful");
      setSuccess(true);
    } catch (error) {
      console.error("Payment failed:", error);
      message.error("Payment failed");
    } finally {
      setPaying(false);
    }
  }

  if (success) {
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
          <Card style={{ maxWidth: 620, width: "100%", borderRadius: 20 }}>
            <Result
              icon={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              title="Payment Successful"
              subTitle="Your order has been paid successfully."
              extra={[
                <Button
                  type="primary"
                  key="orders"
                  onClick={() => navigate("/orders")}
                >
                  View Orders
                </Button>,
                <Button key="products" onClick={() => navigate("/products")}>
                  Continue Shopping
                </Button>,
              ]}
            />
          </Card>
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
        <Space size={12}>
          <CreditCardOutlined style={{ fontSize: 28, color: "#1677ff" }} />
          <div>
            <Title level={3} style={{ margin: 0, lineHeight: 1.1 }}>
              Payment
            </Title>
            <Text type="secondary">Enter your card information</Text>
          </div>
        </Space>

        <Link to="/cart">
          <Button icon={<ArrowLeftOutlined />}>Back to Cart</Button>
        </Link>
      </Header>

      <Content style={{ padding: 32 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Card
                style={{
                  borderRadius: 22,
                  minHeight: 260,
                  background:
                    "linear-gradient(135deg, #1677ff 0%, #722ed1 100%)",
                  color: "#fff",
                  boxShadow: "0 16px 40px rgba(22,119,255,0.25)",
                }}
              >
                <Space
                  direction="vertical"
                  size={28}
                  style={{ width: "100%" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                      CrazyShop Card
                    </Text>
                    <CreditCardOutlined style={{ fontSize: 32 }} />
                  </div>

                  <Title
                    level={3}
                    style={{
                      color: "#fff",
                      margin: 0,
                      letterSpacing: 2,
                      fontWeight: 600,
                    }}
                  >
                    {formattedCardPreview}
                  </Title>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Text style={{ color: "rgba(255,255,255,0.65)" }}>
                        Card Holder
                      </Text>
                      <br />
                      <Text strong style={{ color: "#fff" }}>
                        {form.getFieldValue("cardHolderName") || "YOUR NAME"}
                      </Text>
                    </div>

                    <div>
                      <Text style={{ color: "rgba(255,255,255,0.65)" }}>
                        Expiry
                      </Text>
                      <br />
                      <Text strong style={{ color: "#fff" }}>
                        {form.getFieldValue("expiry") || "MM/YY"}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>

              <Card
                style={{
                  marginTop: 24,
                  borderRadius: 18,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                }}
              >
                <Space align="start">
                  <LockOutlined style={{ fontSize: 22, color: "#52c41a" }} />
                  <div>
                    <Text strong>Secure payment</Text>
                    <br />
                    <Text type="secondary">
                      This is a demo payment page. Do not store real CVV or card
                      numbers in your database.
                    </Text>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={14}>
              <Card
                title="Card Details"
                style={{
                  borderRadius: 18,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  size="large"
                  onFinish={handlePayment}
                  autoComplete="off"
                >
                  <Form.Item
                    label="Card Holder Name"
                    name="cardHolderName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter card holder name",
                      },
                    ]}
                  >
                    <Input placeholder="e.g. Nancy Wei" />
                  </Form.Item>

                  <Form.Item
                    label="Card Number"
                    name="cardNumber"
                    normalize={formatCardNumber}
                    rules={[
                      {
                        required: true,
                        message: "Please enter card number",
                      },
                      {
                        validator: (_, value) => {
                          const card = String(value || "").replace(/\s/g, "");

                          if (card.length !== 16) {
                            return Promise.reject(
                              new Error("Card number must be 16 digits")
                            );
                          }

                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      prefix={<CreditCardOutlined />}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Expiry Date"
                        name="expiry"
                        normalize={formatExpiry}
                        rules={[
                          {
                            required: true,
                            message: "Please enter expiry date",
                          },
                          {
                            pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
                            message: "Use MM/YY format",
                          },
                        ]}
                      >
                        <Input placeholder="MM/YY" maxLength={5} />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        label="CVV"
                        name="cvv"
                        rules={[
                          {
                            required: true,
                            message: "Please enter CVV",
                          },
                          {
                            pattern: /^\d{3,4}$/,
                            message: "CVV must be 3 or 4 digits",
                          },
                        ]}
                      >
                        <Input.Password placeholder="123" maxLength={4} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />

                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={paying}
                    icon={<LockOutlined />}
                    style={{ height: 48 }}
                  >
                    Pay Now
                  </Button>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}

export default PaymentPage;