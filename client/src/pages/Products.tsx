import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { productService } from '../services';
import { Product } from '../types';
import { useSnackbar } from 'notistack';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.products || []);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mesazhi || 'Failed to load products', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setValue('emri', product.emri);
      setValue('pershkrimi', product.pershkrimi);
      setValue('cmimi', product.cmimi);
      setValue('stoku', product.stoku);
      setValue('foto', product.foto);
      setValue('kategoria', product.kategoria);
    } else {
      setEditingProduct(null);
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    try {
      if (editingProduct) {
        await productService.update(editingProduct._id, data);
        enqueueSnackbar('Product updated successfully', { variant: 'success' });
      } else {
        await productService.create(data);
        enqueueSnackbar('Product created successfully', { variant: 'success' });
      }
      handleCloseDialog();
      fetchProducts();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mesazhi || 'Operation failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        enqueueSnackbar('Product deleted successfully', { variant: 'success' });
        fetchProducts();
      } catch (error: any) {
        enqueueSnackbar(error.response?.data?.mesazhi || 'Delete failed', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'emri', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'kategoria', headerName: 'Category', flex: 1, minWidth: 120 },
    { field: 'cmimi', headerName: 'Price ($)', width: 100 },
    { field: 'stoku', headerName: 'Stock', width: 80 },
    {
      field: 'foto',
      headerName: 'Image',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <img src={params.value} alt="Product" style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row as Product)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row._id)} color="error">
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Products</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Product
        </Button>
      </Box>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          <DialogContent>
            <TextField
              {...register('emri', { required: true })}
              label="Product Name"
              fullWidth
              margin="normal"
              required
            />
            <TextField
              {...register('pershkrimi', { required: true })}
              label="Description"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              required
            />
            <TextField
              {...register('cmimi', { required: true, valueAsNumber: true })}
              label="Price"
              type="number"
              fullWidth
              margin="normal"
              required
              inputProps={{ step: '0.01' }}
            />
            <TextField
              {...register('stoku', { required: true, valueAsNumber: true })}
              label="Stock"
              type="number"
              fullWidth
              margin="normal"
              required
            />
            <TextField
              {...register('foto')}
              label="Image URL"
              fullWidth
              margin="normal"
            />
            <TextField
              {...register('kategoria')}
              label="Category"
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingProduct ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
