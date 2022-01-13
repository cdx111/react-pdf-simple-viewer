import 'react-app-polyfill/ie11';
import * as React from 'react';
import styled from 'styled-components';
import { useEffect } from 'react';
import { useState } from 'react';
const ToolStyle = styled.div`
  background-color: #222;
  border:1px solid rgba(255,255,255,.2);
  height: 32px;
  position: fixed;
  bottom: 30px;
  left: 0;
  right: 0;
  margin: auto;
  width: 200px;
  border-radius: 4px;
  box-shadow:0 -4px 13px 4px rgb(0 0 0 / 12%);
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
`

const PaginationStyle = styled.div`
  input{
    outline: 0;
    border: none;
    background: transparent;
    color: #fff;
    width: 35px;
    padding: 0 8px;
    font-size: 14px;
    box-sizing:border-box;
    text-align: center;
  }
  span{
    margin-left:8px;
  }
`

type PaginationProps = {
  total: number;
  current: number;
  onChange?: (page: number) => void;

}

const Pagination: React.FC<PaginationProps> = ({ total, current, onChange }) => {
  const [page, setPage] = useState<string | number>(1);

  useEffect(() => {
    setPage(current);
    return
  }, [current]);

  return <PaginationStyle>
    <input value={page} onKeyUp={(e) => {
      if (e.keyCode === 13) {
        onChange?.(page === '' ? 1 : page as number)
      }
    }} onInput={(e) => {
      if (e.currentTarget.value === '') {
        setPage(e.currentTarget.value)
        return
      }
      const page = parseInt(e.currentTarget.value, 10);
      if (!isNaN(page)) {
        setPage(page)
      }
    }} />/<span>{total}</span>
  </PaginationStyle>
}

type ToolProps = {
  pagination: PaginationProps
}

const Tool: React.FC<ToolProps> = ({ pagination }) => {
  return <ToolStyle>
    <Pagination {...pagination} ></Pagination>
  </ToolStyle>;
};

export default Tool;
