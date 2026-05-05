import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Card, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { register, sendVerificationCode } from "../api/user";

function Register() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);

  async function handleSendCode() {
    try {
      const email = form.getFieldValue("email");

      if (!email) {
        message.warning("Please enter your email first");
        return;
      }

      await form.validateFields(["email"]);

      setSendingCode(true);

      await sendVerificationCode(email);

      message.success("Verification code sent to your email");

      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      message.error(err.message || "Failed to send code");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleRegister(values) {
    try {
      await register(
        values.username,
        values.email,
        values.password,
        values.code
      );

      message.success("Register successful");
      navigate("/login");
    } catch (err) {
      message.error(err.message || "Register failed");
    }
  }

  return (
    <div style={styles.container}>
      <Card title="Create Account" style={styles.card}>
        <Form form={form} layout="vertical" onFinish={handleRegister}>
          <Form.Item
            label="Username"
            name="username"
            rules={[
              {
                required: true,
                message: "Please enter your username",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email",
              },
              {
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Verification Code"
            name="code"
            rules={[
              {
                required: true,
                message: "Please enter the verification code",
              },
            ]}
          >
            <Input
              prefix={<SafetyOutlined />}
              placeholder="Enter verification code"
              size="large"
              addonAfter={
                <Button
                  type="link"
                  disabled={countdown > 0}
                  loading={sendingCode}
                  onClick={handleSendCode}
                  style={{ padding: 0 }}
                >
                  {countdown > 0 ? `${countdown}s` : "Send Code"}
                </Button>
              }
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Please confirm your password",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("The two passwords do not match")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Register
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
            <span>Already have an account? </span>
            <Button type="link" onClick={() => navigate("/login")}>
              Login now
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    width: 420,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
};

export default Register;