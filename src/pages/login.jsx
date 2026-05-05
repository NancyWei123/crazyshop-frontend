import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "../api/user";

function Login() {
  const navigate = useNavigate();

  async function handleLogin(values) {
    try {
      const data = await login(values.email, values.password);

      localStorage.setItem("token", data.token);

      message.success("Login successful");
      navigate("/");
    } catch (err) {
      message.error(err.message || "Login failed");
    }
  }

  return (
    <div style={styles.container}>
      <Card title="Login" style={styles.card}>
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              Login
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "center" }}>
            <span>Don't have an account? </span>
            <Button type="link" onClick={() => navigate("/register")}>
              Register now
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
    width: 380,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
};

export default Login;