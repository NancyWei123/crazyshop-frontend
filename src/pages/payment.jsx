// src/pages/payment.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Result,
  Spin,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { getMyCart } from "../api/cart";

const { Title, Text } = Typography;

const PAYMENT_BASE_URL = "http://localhost:8084/api/payments";

export default function Payment() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    async function loadCart() {
      try {
        setLoading(true);
        const data = await getMyCart();
        setCart(data);
      } catch (error) {
        message.error("Failed to load cart: " + error.message);
      } finally {
        setLoading(false);
      }
  }

  loadCart();
}, [navigate]);

  function getCartItems() {
    if (!cart) return [];

    if (Array.isArray(cart)) return cart;

    return cart.items || cart.cartItems || [];
  }

  function getProductId(item) {
    return item.productId || item.id;
  }

  function getProductName(item) {
    return item.productName || item.name || "Unknown Product";
  }

  function getQuantity(item) {
    return item.quantity || 1;
  }

  function getPrice(item) {
    return item.price || item.productPrice || 0;
  }

  function calculateTotal() {
    const items = getCartItems();

    return items.reduce((sum, item) => {
      return sum + Number(getPrice(item)) * Number(getQuantity(item));
    }, 0);
  }

  async function handlePay(values) {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token) {
      message.warning("Please login first");
      navigate("/login");
      return;
    }

    const totalAmount = calculateTotal();

    if (totalAmount <= 0) {
      message.warning("Your cart is empty");
      return;
    }

    try {
      setPaying(true);

      /**
       * Step 1: create payment
       *
       * For now, we use orderId from localStorage.
       * Later, after you create order from cart, save orderId:
       * localStorage.setItem("currentOrderId", order.id)
       */
      const orderId = Number(localStorage.getItem("currentOrderId")) || 1;

      const createPaymentResponse = await fetch(PAYMENT_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Id": userId || "",
        },
        body: JSON.stringify({
          orderId,
          amount: totalAmount,
          paymentMethod: "CARD",
        }),
      });

      if (!createPaymentResponse.ok) {
        throw new Error("Failed to create payment");
      }

      const createdPayment = await createPaymentResponse.json();

      /**
       * Step 2: pay
       */
      const payResponse = await fetch(`${PAYMENT_BASE_URL}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-User-Id": userId || "",
        },
        body: JSON.stringify({
          paymentId: createdPayment.id,
          cardNumber: values.cardNumber,
          cardHolderName: values.cardHolderName,
          expiryDate: values.expiryDate,
          cvv: values.cvv,
        }),
      });

      if (!payResponse.ok) {
        throw new Error("Payment failed");
      }

      const paidPayment = await payResponse.json();

      setPaymentResult(paidPayment);
      setSuccess(true);
      message.success("Payment successful");
    } catch (error) {
      message.error(error.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.center}>
        <Spin size="large" />
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.page}>
        <Result
          status="success"
          title="Payment Successful"
          subTitle={`Transaction ID: ${
            paymentResult?.transactionId || "Generated successfully"
          }`}
          extra={[
            <Button type="primary" key="orders" onClick={() => navigate("/orders")}>
              View Orders
            </Button>,
            <Button key="shop" onClick={() => navigate("/")}>
              Continue Shopping
            </Button>,
          ]}
        />
      </div>
    );
  }

  const items = getCartItems();
  const totalAmount = calculateTotal();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/cart")}
          style={styles.backButton}
        >
          Back to Cart
        </Button>

        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Payment
          </Title>
          <Text type="secondary">Complete your order securely</Text>
        </div>
      </div>

      <div style={styles.layout}>
        <Card style={styles.paymentCard}>
          <div style={styles.cardTitle}>
            <CreditCardOutlined style={styles.titleIcon} />
            <Title level={4} style={{ margin: 0 }}>
              Card Information
            </Title>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            onFinish={handlePay}
            initialValues={{
              cardHolderName: "",
              cardNumber: "",
              expiryDate: "",
              cvv: "",
            }}
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
              <Input
                size="large"
                placeholder="Nancy Wei"
                prefix={<CreditCardOutlined />}
              />
            </Form.Item>

            <Form.Item
              label="Card Number"
              name="cardNumber"
              rules={[
                {
                  required: true,
                  message: "Please enter card number",
                },
                {
                  min: 12,
                  message: "Card number is too short",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="4242 4242 4242 4242"
                maxLength={19}
              />
            </Form.Item>

            <div style={styles.formRow}>
              <Form.Item
                label="Expiry Date"
                name="expiryDate"
                rules={[
                  {
                    required: true,
                    message: "Enter expiry date",
                  },
                ]}
                style={{ flex: 1 }}
              >
                <Input size="large" placeholder="12/28" />
              </Form.Item>

              <Form.Item
                label="CVV"
                name="cvv"
                rules={[
                  {
                    required: true,
                    message: "Enter CVV",
                  },
                  {
                    min: 3,
                    message: "Invalid CVV",
                  },
                ]}
                style={{ flex: 1 }}
              >
                <Input.Password
                  size="large"
                  placeholder="123"
                  maxLength={4}
                  prefix={<LockOutlined />}
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Amount"
              name="amount"
              initialValue={totalAmount}
            >
              <InputNumber
                size="large"
                value={totalAmount}
                disabled
                prefix="$"
                style={{ width: "100%" }}
              />
            </Form.Item>

            <div style={styles.securityBox}>
              <SafetyCertificateOutlined />
              <Text type="secondary">
                This is a mock payment page for your project. Do not use real card
                information.
              </Text>
            </div>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={paying}
              icon={<CreditCardOutlined />}
              style={styles.payButton}
            >
              Pay ${totalAmount.toFixed(2)}
            </Button>
          </Form>
        </Card>

        <Card style={styles.summaryCard}>
          <Title level={4}>Order Summary</Title>

          <Divider />

          <div style={styles.summaryList}>
            {items.length === 0 ? (
              <Text type="secondary">Your cart is empty</Text>
            ) : (
              items.map((item) => (
                <div key={getProductId(item)} style={styles.summaryItem}>
                  <div>
                    <Text strong>{getProductName(item)}</Text>
                    <br />
                    <Text type="secondary">
                      Qty: {getQuantity(item)} × ${Number(getPrice(item)).toFixed(2)}
                    </Text>
                  </div>

                  <Text strong>
                    ${(Number(getPrice(item)) * Number(getQuantity(item))).toFixed(2)}
                  </Text>
                </div>
              ))
            )}
          </div>

          <Divider />

          <div style={styles.totalRow}>
            <Text strong>Total</Text>
            <Text style={styles.totalPrice}>${totalAmount.toFixed(2)}</Text>
          </div>

          <Button
            block
            size="large"
            onClick={() => navigate("/cart")}
            style={styles.editCartButton}
          >
            Edit Cart
          </Button>
        </Card>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb 0%, #eef3ff 100%)",
    padding: "32px",
  },
  header: {
    maxWidth: "1150px",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  backButton: {
    borderRadius: "10px",
  },
  layout: {
    maxWidth: "1150px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.4fr 0.9fr",
    gap: "24px",
  },
  paymentCard: {
    borderRadius: "22px",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  summaryCard: {
    borderRadius: "22px",
    height: "fit-content",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  titleIcon: {
    fontSize: "24px",
    color: "#1677ff",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
  securityBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "#f6ffed",
    border: "1px solid #b7eb8f",
    marginBottom: "24px",
  },
  payButton: {
    width: "100%",
    height: "50px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  summaryItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  totalPrice: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#cf1322",
  },
  editCartButton: {
    borderRadius: "12px",
  },
  center: {
    minHeight: "75vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};