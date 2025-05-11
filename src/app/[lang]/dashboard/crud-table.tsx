'use client';
import * as React from 'react';
import { Crud } from '@toolpad/core/Crud';
import { employeesDataSource, Employee, employeesCache } from './employees';

export const CrudTable = () => {
  return (
    // <div>
    //   Hello world!
    //   <br />
    //   {/* {JSON.stringify(
    //     employeesDataSource.getMany({ paginationModel: '', filterModel: '', sortModel: '' }),
    //   )} */}
    // </div>
    <Crud<Employee>
      dataSource={employeesDataSource}
      dataSourceCache={employeesCache}
      rootPath="/dashboard"
      initialPageSize={25}
      defaultValues={{ itemCount: 1 }}
    />
  );
};
