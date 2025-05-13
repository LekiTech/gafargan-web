'use client';
import * as React from 'react';
import { FC } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { Collapse, TableHead, Typography } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Word } from '@repository/entities/Word';

interface TablePaginationActionsProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.MouseEvent<HTMLButtonElement>, newPage: number) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

function Row(props: { row: Word }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.spelling}
        </TableCell>
        <TableCell align="right">
          {row.langDialect.language + ' ' + row.langDialect.dialect}
        </TableCell>
        <TableCell align="right">{row.spellingVariants.length}</TableCell>
        <TableCell align="right">{row.details.length}</TableCell>
        {/* <TableCell align="right">{row.createdBy.name}</TableCell> */}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              {row.details.map((detailsRow) => (
                <Paper elevation={1}>
                  <Typography key={detailsRow.id} variant="subtitle2" gutterBottom component="div">
                    {detailsRow.inflection}
                  </Typography>
                  <Typography variant="body2" gutterBottom component="div">
                    {detailsRow.langDialect.language + ' ' + (detailsRow.langDialect.dialect ?? '')}
                  </Typography>
                  <Typography variant="body2" gutterBottom component="div">
                    {detailsRow.source?.name + ' - ' + detailsRow.source?.authors}
                  </Typography>
                  <Typography variant="body2" gutterBottom component="div">
                    {detailsRow.definitions.flatMap((d) => {
                      return (
                        <>
                          {d.values.map((v) =>
                            v.tags && v.tags.length > 0 ? v.tags.join(', ') : '',
                          )}
                          <Typography>{d.values.map((v) => v.value).join(', ')}</Typography>
                        </>
                      );
                    })}
                  </Typography>
                  {detailsRow.examples.map((example, i) => (
                    <Typography
                      key={`exp_det_${i}`}
                      variant="body2"
                      sx={{
                        mb: '10px',
                        borderLeftWidth: '2px',
                        borderLeftStyle: 'solid',
                        borderLeftColor: 'grey.300',
                        paddingLeft: '10px',
                      }}
                      className="example-text"
                    >
                      {example.raw}
                    </Typography>
                  ))}
                  {detailsRow.definitions.length > 1 && (
                    <Typography variant="body2" color="text.secondary">
                      {`And ${detailsRow.definitions.length - 1} more definitions`}
                    </Typography>
                  )}
                </Paper>
              ))}
              {/* <Typography variant="h6" gutterBottom component="div">
                Definitions
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Inflection</TableCell>
                    <TableCell>Definitions</TableCell>
                    <TableCell>Language</TableCell>
                    <TableCell>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details.map((detailsRow) => (
                    <TableRow key={detailsRow.id}>
                      <TableCell component="th" scope="row">
                        {detailsRow.inflection}
                      </TableCell>
                      <TableCell>
                        {detailsRow.definitions
                          .flatMap((d) => d.values.map((v) => v.value))
                          .join(', ')}
                      </TableCell>
                      <TableCell>{detailsRow.langDialect.language}</TableCell>
                      <TableCell>
                        {detailsRow.source?.name + ' - ' + detailsRow.source?.authors}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table> */}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export const CustomPaginationActionsTable: FC<{ words: Word[] }> = ({ words }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  // Avoid a layout jump when reaching the last page with empty rows.
  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '65vh' }}>
        <Table stickyHeader sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '25px' }} />
              <TableCell style={{ minWidth: '150px' }}>Word</TableCell>
              <TableCell style={{ minWidth: '80px' }} align="right">
                Language & dialect
              </TableCell>
              <TableCell style={{ width: '200px' }} align="right">
                Variations amount
              </TableCell>
              <TableCell style={{ width: '200px' }} align="right">
                Definitions amount
              </TableCell>
              {/* <TableCell align="right">Added by</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {words.map((row) => (
              <Row key={row.id} row={row} />
              // <TableRow key={row.id}>
              //   <TableCell component="th" scope="row">
              //     {row.spelling}
              //   </TableCell>
              //   <TableCell style={{ width: 160 }} align="right">
              //     {row.langDialect.language + ' ' + row.langDialect.dialect}
              //   </TableCell>
              //   <TableCell style={{ width: 160 }} align="right">
              //     {row.spellingVariants.map((sv) => sv.spelling).join(', ')}
              //   </TableCell>
              // </TableRow>
            ))}
            {/* {emptyRows > 0 && (
            <TableRow style={{ height: 53 * emptyRows }}>
              <TableCell colSpan={6} />
            </TableRow>
          )} */}
          </TableBody>
          <TableFooter>
            <TableRow></TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
        colSpan={3}
        count={words.length}
        rowsPerPage={rowsPerPage}
        page={page}
        slotProps={{
          select: {
            inputProps: {
              'aria-label': 'rows per page',
            },
            native: true,
          },
        }}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />
    </Paper>
  );
};
