import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Edit, Delete } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { userService } from '../services';
import { User } from '../types';
import { useSnackbar } from 'notistack';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      setUsers(response.users || []);
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mesazhi || 'Failed to load users', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user: User) => {
    setEditingUser(user);
    setValue('emri', user.emri);
    setValue('email', user.email);
    setValue('role', user.role);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    reset();
  };

  const onSubmit = async (data: any) => {
    if (!editingUser) return;

    try {
      await userService.update(editingUser._id, data);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.mesazhi || 'Update failed', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(id);
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        fetchUsers();
      } catch (error: any) {
        enqueueSnackbar(error.response?.data?.mesazhi || 'Delete failed', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'emri', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value === 'admin' ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Joined',
      width: 180,
      valueFormatter: (params) => new Date(params).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleOpenDialog(params.row as User)}>
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
      <Typography variant="h4" gutterBottom>
        Users
      </Typography>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          getRowId={(row) => row._id}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </Box>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField
              {...register('emri', { required: true })}
              label="Name"
              fullWidth
              margin="normal"
              required
            />
            <TextField
              {...register('email', { required: true })}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select {...register('role')} defaultValue="user" label="Role">
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
            <TextField
              {...register('fjalekalimi')}
              label="New Password (optional)"
              type="password"
              fullWidth
              margin="normal"
              helperText="Leave empty to keep current password"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Update
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
