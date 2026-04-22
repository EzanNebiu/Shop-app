import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { orderService } from '../services';
import { Order } from '../types';
import { useSnackbar } from 'notistack';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.orders || []);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mesazhi || 'Failed to load orders', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      enqueueSnackbar('Order status updated', { variant: 'success' });
      fetchOrders();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mesazhi || 'Update failed', { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'data_e_blerjes',
      headerName: 'Date',
      width: 180,
      valueFormatter: (params) => new Date(params).toLocaleString(),
    },
    {
      field: 'user',
      headerName: 'Customer',
      flex: 1,
      minWidth: 150,
      valueGetter: (params, row) => row.perdoruesi_id?.emri || 'N/A',
    },
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      minWidth: 150,
      valueGetter: (params, row) => row.produkti_id?.emri || 'N/A',
    },
    { field: 'sasia', headerName: 'Quantity', width: 100 },
    {
      field: 'cmimi_total',
      headerName: 'Total ($)',
      width: 120,
      valueFormatter: (params) => `$${params.toFixed(2)}`,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <FormControl size="small" fullWidth>
          <Select
            value={params.value}
            onChange={(e) => handleStatusChange(params.row._id, e.target.value)}
            size="small"
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Orders
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={orders}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>
    </Box>
  );
}
