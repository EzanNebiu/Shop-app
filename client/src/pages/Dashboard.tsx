import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Inventory,
  People,
  ShoppingCart,
  AttachMoney,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { analyticsService } from '../services';
import { Analytics } from '../types';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsService.getAnalytics();
      setAnalytics(response.analytics);
    } catch (err: any) {
      setError(err.response?.data?.mesazhi || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!analytics) {
    return <Alert severity="info">No data available</Alert>;
  }

  const stats = [
    {
      title: 'Total Products',
      value: analytics.summary.totalProducts,
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total Users',
      value: analytics.summary.totalUsers,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#388e3c',
    },
    {
      title: 'Total Orders',
      value: analytics.summary.totalOrders,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: '#f57c00',
    },
    {
      title: 'Total Revenue',
      value: `$${analytics.summary.totalRevenue.toFixed(2)}`,
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Sales Over Time */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sales Over Time (Last 7 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalRevenue" stroke="#8884d8" name="Revenue" />
                <Line type="monotone" dataKey="totalOrders" stroke="#82ca9d" name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Selling Products
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analytics.topProducts.map((item, index) => (
                <Box
                  key={item._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 2,
                    pb: 2,
                    borderBottom: index < analytics.topProducts.length - 1 ? '1px solid #eee' : 'none',
                  }}
                >
                  <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                    {item.product.emri}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {item.totalSold} sold
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Orders by Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Orders by Status
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Low Stock Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alert
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analytics.lowStockProducts.length > 0 ? (
                analytics.lowStockProducts.map((product) => (
                  <Box
                    key={product._id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Typography variant="body2">{product.emri}</Typography>
                    <Typography variant="body2" color="error" fontWeight="bold">
                      {product.stoku} left
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  All products are well stocked
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
