import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface IInitialState {
  headerHeight: number
}


const initialState: IInitialState = {
  headerHeight: 0
}

const headerSlice = createSlice({
  name: 'headerSlice',
  initialState,
  reducers: {
    setHeaderHeight: (state, action: PayloadAction<number>) => {
      state.headerHeight = action.payload
    }
  }
})

export const HeaderActions = headerSlice.actions
export const HeaderReducer = headerSlice.reducer