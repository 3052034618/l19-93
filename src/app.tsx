import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { AppProvider } from '@/store';
import './app.scss';

function App(props) {
  useEffect(() => {
    console.log('[App] 初始化');
  }, []);

  useDidShow(() => {
    console.log('[App] onShow');
  });

  useDidHide(() => {
    console.log('[App] onHide');
  });

  return (
    <AppProvider>
      {props.children}
    </AppProvider>
  );
}

export default App;
