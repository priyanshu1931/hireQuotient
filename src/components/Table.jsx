import * as React from "react";
import { useEffect, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import CancelIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import Box from "@mui/material/Box";
// import DeleteIcon from '@mui/icons-material/Delete';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from "@mui/x-data-grid";
import { cleanFilterItem } from "@mui/x-data-grid/hooks/features/filter/gridFilterUtils";

export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = React.useState([]);
  const [originalRows, setOriginalRows] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [queryStr, setQueryStr] = useState("");
  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  useEffect(() => {
    (async () => {
      const initialRows = await axios.get(
        "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
      );
      setOriginalRows(initialRows.data);
    })();
  }, []);

  useEffect(() => {
    const updatedRows = originalRows.filter((row) => {
      return (
        row.name.includes(queryStr) ||
        row.role.includes(queryStr) ||
        row.email.includes(queryStr)
      );
    });
    setRows(updatedRows);
  }, [queryStr, originalRows]);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    console.log(id)
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: "name", headerName: "Name", width: 280, editable: true },
    {
      field: "email",
      headerName: "Email",
      width: 280,
      align: "left",
      headerAlign: "left",
      editable: true,
    },
    {
      field: "role",
      headerName: "Role",
      width: 160,
      editable: true,
      type: "singleSelect",
      valueOptions: ["member", "admin"],
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 280,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: "primary.main",
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const handleMultipleDelete=()=>{
    setRows(prevRows => prevRows.filter(row => !rowSelectionModel.includes(row.id)));
    setRowSelectionModel([]);
  };
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedRows = rows.slice(startIndex, endIndex);

  return (
    <>
      <TextField
        id="standard-basic"
        variant="standard"
        placeholder="Search"
        sx={{ my: 2 }}
        value={queryStr}
        onChange={(e) => {
          setQueryStr(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <SearchIcon
              sx={{ color: "action.active", mr: 1, pointerEvents: "none" }}
            />
          ),
        }}
      />
      <Box
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1,
        bgcolor: '#ff7c7c',
        '&:hover': {
          bgcolor: 'red',
        },
        float:"right",
        my:2,
        display: 'flex',
        alignItems: "center",
        justifyContent:"center",align:"center"
      }}>
        
       <DeleteIcon
        onClick={handleMultipleDelete}
        sx={{ cursor: "pointer", color: "action.active", float:"right" , justifyContent:"center",align:"center", alignItems: "center"}}
      />
      </Box>
      <DataGrid
        rows={displayedRows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        checkboxSelection
        hideFooterPagination={true}
        hideFooter={true}
        disableRowSelectionOnClick
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
      />
      <Pagination
        count={Math.ceil(rows.length / pageSize)}
        page={currentPage}
        onChange={handlePageChange}
        sx={{ float: 'right', my:2}}
      />
    </>
  );
}
