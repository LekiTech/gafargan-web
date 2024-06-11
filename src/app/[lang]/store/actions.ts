import {useDispatch} from 'react-redux'
import {bindActionCreators} from '@reduxjs/toolkit'
import { HeaderActions } from '@/store/slices/header.slice';

const actions = {
  ...HeaderActions
}

export function useActions() {
  const dispatch = useDispatch();

  return bindActionCreators(actions, dispatch)
}