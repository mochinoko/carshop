import React, { useState, useEffect, useRef } from 'react';

import { AgGridReact } from 'ag-grid-react';
import EditCar from './EditCar';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import AddCar from './AddCar';


function Carlist() {

    const [cars, setCars] = useState([]);

    const [open, setOpen] =useState(false);

    const [msg, setMsg] = useState(false);
    const gridRef = useRef();

     useEffect(() => {
           getCars();
       }, [])


       const columns = [
           {headerName: 'Brand', field:'brand', sortable: true, filter:true },
           {headerName: 'Model', field:'model', sortable: true, filter:true },
           {headerName: 'Color', field:'color', sortable: true, filter:true },
           {headerName: 'Fuel', field:'fuel', sortable: true, filter:true },
           {headerName: 'Year', field:'year', sortable: true, filter:true, width: 120 },
           {headerName: 'Price', field:'price', sortable: true, filter:true, width: 120  },
           {
               headerName: '',
               width: 90,
               field: '_links.self.href',
               cellRendererFramework: params => <EditCar 
                                                updateCar={updateCar} 
                                                params = {params} />
           },
           {
            headerName: '', 
            width: 90,
            field: '_links.self.href',
            cellRendererFramework: params => <Button
                                                 color='secondary'
                                                 size='small'
                                                 onClick={()=> deleteCar(params.value)}>Delete</Button>
        }
       ]

    const getCars = () => {
        fetch('https://carstockrest.herokuapp.com/cars')
        .then(response => response.json())
        .then(data => setCars(data._embedded.cars)) //contains arrays of car
        .catch(err => console.error(err))
    }

    const deleteCar =(link) => {
        if(window.confirm('Are you sure?')){
            fetch(link, {
                method: 'DELETE'
            })
            .then(_ => getCars())
            //.then(_ => gridRef.current.refreshCells({rowNodes: getCars()}))
            .then(_ => setMsg('Car was deleteed succesfully'))
            .then(_ =>  setOpen(true))
            .catch(err=> console.err(err))
        }
    }

    const addCar = (newCar) => {
        fetch('https://carstockrest.herokuapp.com/cars',{
            method: 'POST',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(newCar)
        })
        .then(_ =>  getCars())
        .then(_ => setMsg('Car added!'))
        .then(_ => setOpen(true))
        .catch(err => console.err(err))

    }

    const updateCar = (link, car) => {
        fetch(link, {
            method: 'PUT',
            headers: {
                'Content-type' : 'application/json'
            },
            body: JSON.stringify(car)
        })
       
        .then(_ => getCars())
        .then(_ => setMsg('Car was modified succesfully'))
        .then(_ =>  setOpen(true))
        .catch(err => console.error(err))
    }

    const handleClose = () => {
        setOpen(false);
    }

    return(
        <div>
        <AddCar addCar={addCar}/>
        <div className="ag-theme-material" style={{height: '700px', width: '70%', margin: 'auto'}}>
          
           <AgGridReact  
           ref={gridRef}
           onGridReady= { params => {
               gridRef.current = params.api
               params.api.sizeColumnsToFit();
           }}
           columnDefs={columns}
           suppressCellSelection={true}
           rowData={cars}
           pagination={true}
           paginationPageSize={10}
           >
           </AgGridReact>
           <Snackbar 
           open={open}
           autoHideDuration={3000}
           onClose={handleClose}
           message={msg}
           />
           </div>
        </div>
    );
}

export default Carlist;