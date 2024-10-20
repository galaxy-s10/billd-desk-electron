import path from 'path';
import { platform } from 'process';

import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  powerMonitor,
  powerSaveBlocker,
  screen,
  shell,
} from 'electron';

import { IPC_EVENT } from '../src/event';
import { IIpcRendererData } from '../src/interface';

import { nutjsTs } from './types';

const nutjs: nutjsTs = require('@nut-tree-fork/nut-js');

// 该版本electron所对应的node版本
console.log('process.version', process.version);
// electron版本
console.log('process.versions.electron', process.versions.electron);
// abi版本
console.log('process.versions.modules', process.versions.modules);

// https://www.electronjs.org/zh/docs/latest/tutorial/security#%E9%9A%94%E7%A6%BB%E4%B8%8D%E5%8F%97%E4%BF%A1%E4%BB%BB%E7%9A%84%E5%86%85%E5%AE%B9
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public');

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

const windowNormalParams = { width: 800, height: 500 };
let win: BrowserWindow | null;
let winBounds: Electron.Rectangle | null;
const childWindowMap = new Map<number, BrowserWindow>();

function handleUrlQuery(obj: Record<string, string>) {
  let res = '';
  Object.keys(obj).forEach((item) => {
    res += `${item}=${obj[item]}&`;
  });
  if (res.length > 0) {
    return `?${res.slice(0, -1)}`;
  } else {
    return res;
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: windowNormalParams.width,
    height: windowNormalParams.height,
    // 隐藏菜单栏
    autoHideMenuBar: true,
    webPreferences: {
      // devTools: true,
      // nodeIntegration: true, // 在网页中集成Node
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
  });
  winBounds = win.getBounds();

  ipcMain.on(
    IPC_EVENT.shellOpenExternal,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.shellOpenExternal}`, reqData);
      const { requestId, data } = reqData;
      const { url } = data;
      try {
        await shell.openExternal(url);
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_shellOpenExternal, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );
  ipcMain.on(
    IPC_EVENT.commonTest,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.commonTest}`, reqData);
      const { requestId, data } = reqData;
      const { x, y } = data;
      try {
        await nutjs.mouse.move([{ x, y }]);
        win?.webContents.send(IPC_EVENT.response_commonTest, {
          isErr: false,
          msg: { x, y },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_commonTest, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.powerSaveBlockerStart,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.powerSaveBlockerStart}`, reqData);
      const { requestId } = reqData;
      try {
        powerSaveBlocker.start('prevent-display-sleep');
        win?.webContents.send(IPC_EVENT.response_powerSaveBlockerStart, {
          msg: 'ok',
          requestId,
        });
      } catch (error) {
        console.log('powerSaveBlockerStart失败');
        console.log(error);
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.closeChildWindow,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.closeChildWindow}`, reqData);
      const { requestId, data } = reqData;
      const { windowId } = data;
      try {
        const childWindow = childWindowMap.get(Number(windowId));
        childWindow?.close();
      } catch (error) {
        console.log('closeChildWindow失败');
        console.log(error);
        win?.webContents.send(IPC_EVENT.response_closeChildWindow, {
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.closeAllChildWindow,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.closeAllChildWindow}`, reqData);
      childWindowMap.forEach((item) => {
        item?.close();
      });
    }
  );

  ipcMain.on(IPC_EVENT.closeWindow, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.closeWindow}`, reqData);
    const { requestId } = reqData;
    try {
      win?.close();
    } catch (error) {
      console.log(error);
      win?.webContents.send(IPC_EVENT.response_closeWindow, {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });

  ipcMain.on(IPC_EVENT.windowMinimize, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.windowMinimize}`, reqData);
    const { requestId } = reqData;
    try {
      win?.minimize();
    } catch (error) {
      console.log(error);
      win?.webContents.send(IPC_EVENT.response_windowMinimize, {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });

  ipcMain.on(IPC_EVENT.windowMaximize, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.windowMaximize}`, reqData);
    const { requestId } = reqData;
    try {
      win?.maximize();
    } catch (error) {
      console.log(error);
      win?.webContents.send(IPC_EVENT.response_windowMaximize, {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });

  ipcMain.on(
    IPC_EVENT.handleOpenDevTools,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.handleOpenDevTools}`, reqData);
      const { requestId, data } = reqData;
      const { windowId } = data;
      try {
        if (windowId) {
          const childWindow = childWindowMap.get(Number(windowId));
          childWindow?.webContents.openDevTools({
            mode: 'detach',
            activate: true,
          });
          childWindow?.webContents.send(IPC_EVENT.response_handleOpenDevTools, {
            requestId,
            msg: 'ok',
          });
        } else {
          win?.webContents.openDevTools({ mode: 'detach', activate: true });
          win?.webContents.send(IPC_EVENT.response_handleOpenDevTools, {
            requestId,
            msg: 'ok',
          });
        }
      } catch (error) {
        console.log(error);
        win?.webContents.send(IPC_EVENT.response_handleOpenDevTools, {
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.handleMoveScreenRightBottom,
    (_event, reqData: IIpcRendererData) => {
      console.log(
        `electron收到${IPC_EVENT.handleMoveScreenRightBottom}`,
        reqData
      );
      const { requestId } = reqData;
      if (!win) return;
      try {
        const { width, height, y } = screen.getPrimaryDisplay().workArea;
        // 窗口的高度和宽度
        const bounds = win.getBounds();
        const windowWidth = bounds.width;
        const windowHeight = bounds.height;
        // const [windowWidth, windowHeight] = win?.getContentSize() ;
        // 计算新位置
        const newX = width - windowWidth; // 屏幕左下角的 X 坐标是 0
        const newY = height - windowHeight; // 需要减去窗口本身的高度
        // 移动窗口
        win.setPosition(newX, newY + y);
      } catch (error) {
        console.log(error);
        win.webContents.send(IPC_EVENT.response_handleMoveScreenRightBottom, {
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseScrollDown,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseScrollDown}`, reqData);
      const { requestId, data } = reqData;
      const { amount } = data;
      try {
        await nutjs.mouse.scrollDown(amount);
        win?.webContents.send(IPC_EVENT.response_mouseScrollDown, {
          isErr: false,
          msg: { amount },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseScrollDown, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseScrollUp,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseScrollUp}`, reqData);
      const { requestId, data } = reqData;
      const { amount } = data;
      try {
        await nutjs.mouse.scrollUp(amount);
        win?.webContents.send(IPC_EVENT.response_mouseScrollUp, {
          isErr: false,
          msg: { amount },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseScrollUp, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseScrollLeft,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseScrollLeft}`, reqData);
      const { requestId, data } = reqData;
      const { amount } = data;
      try {
        await nutjs.mouse.scrollLeft(amount);
        win?.webContents.send(IPC_EVENT.response_mouseScrollLeft, {
          isErr: false,
          msg: { amount },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseScrollLeft, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseScrollRight,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseScrollRight}`, reqData);
      const { requestId, data } = reqData;
      const { amount } = data;
      try {
        await nutjs.mouse.scrollRight(amount);
        win?.webContents.send(IPC_EVENT.response_mouseScrollRight, {
          isErr: false,
          msg: { amount },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseScrollRight, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseSetPosition,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseSetPosition}`, reqData);
      const { requestId, data } = reqData;
      const { x, y } = data;
      try {
        await nutjs.mouse.setPosition({ x, y });
        win?.webContents.send(IPC_EVENT.response_mouseSetPosition, {
          isErr: false,
          msg: { x, y },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseSetPosition, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(IPC_EVENT.mouseMove, async (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.mouseMove}`, reqData);
    const { requestId, data } = reqData;
    const { x, y } = data;
    try {
      await nutjs.mouse.move([{ x, y }]);
      win?.webContents.send(IPC_EVENT.response_mouseMove, {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send(IPC_EVENT.response_mouseMove, {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });

  ipcMain.on(IPC_EVENT.mouseDrag, async (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.mouseDrag}`, reqData);
    const { requestId, data } = reqData;
    const { x, y } = data;
    try {
      await nutjs.mouse.drag([{ x, y }]);
      win?.webContents.send(IPC_EVENT.response_mouseDrag, {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send(IPC_EVENT.response_mouseDrag, {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });

  ipcMain.on(
    IPC_EVENT.keyboardType,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.keyboardType}`, reqData);
      const { requestId, data } = reqData;
      const { key } = data;
      try {
        await nutjs.keyboard.type(key);
        win?.webContents.send(IPC_EVENT.response_keyboardType, {
          isErr: false,
          msg: { key, requestId },
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_keyboardType, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mousePressButtonLeft,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mousePressButtonLeft}`, reqData);
      const { requestId } = reqData;
      try {
        await nutjs.mouse.pressButton(nutjs.Button.LEFT);
        win?.webContents.send(IPC_EVENT.response_mousePressButtonLeft, {
          isErr: false,
          msg: {},
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mousePressButtonLeft, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseReleaseButtonLeft,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseReleaseButtonLeft}`, reqData);
      const { requestId } = reqData;
      try {
        await nutjs.mouse.releaseButton(nutjs.Button.LEFT);
        win?.webContents.send(IPC_EVENT.response_mouseReleaseButtonLeft, {
          isErr: false,
          msg: {},
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseReleaseButtonLeft, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseDoubleClick,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseDoubleClick}`, reqData);
      const { requestId } = reqData;
      try {
        await nutjs.mouse.doubleClick(nutjs.Button.LEFT);
        win?.webContents.send(IPC_EVENT.response_mouseDoubleClick, {
          isErr: false,
          msg: {},
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseDoubleClick, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseLeftClick,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseLeftClick}`, reqData);
      const { requestId, data } = reqData;
      const { x, y } = data;
      try {
        await nutjs.mouse.click(nutjs.Button.LEFT);
        win?.webContents.send(IPC_EVENT.response_mouseLeftClick, {
          isErr: false,
          msg: { x, y },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseLeftClick, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.mouseRightClick,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mouseRightClick}`, reqData);
      const { requestId, data } = reqData;
      const { x, y } = data;
      try {
        await nutjs.mouse.click(nutjs.Button.RIGHT);
        win?.webContents.send(IPC_EVENT.response_mouseRightClick, {
          isErr: false,
          msg: { x, y },
          requestId,
        });
      } catch (error) {
        win?.webContents.send(IPC_EVENT.response_mouseRightClick, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.getMousePosition,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.getMousePosition}`, reqData);
      const { requestId } = reqData;
      const point = await nutjs.mouse.getPosition();
      win?.webContents.send(IPC_EVENT.response_getMousePosition, {
        point,
        requestId,
      });
    }
  );

  ipcMain.on(
    IPC_EVENT.setChildWindowBounds,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.setChildWindowBounds}`, reqData);
      const { requestId, data } = reqData;
      const { windowId, width, height } = data;
      const childWindow = childWindowMap.get(Number(windowId));
      if (!childWindow) return;
      try {
        childWindow.setBounds({ width, height });
        childWindow.webContents.send(IPC_EVENT.response_setChildWindowBounds, {
          width,
          height,
          requestId,
        });
      } catch (error) {
        console.log('setChildWindowBounds错误');
        console.log(error);
        childWindow.webContents.send(IPC_EVENT.response_setChildWindowBounds, {
          isErr: true,
          msg: '',
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.getChildWindowTitlebarHeight,
    (_event, reqData: IIpcRendererData) => {
      console.log(
        `electron收到${IPC_EVENT.getChildWindowTitlebarHeight}`,
        reqData
      );
      const { requestId, data } = reqData;
      const { windowId } = data;
      const childWindow = childWindowMap.get(Number(windowId));
      if (!childWindow) return;
      try {
        const contentBounds = childWindow.getContentBounds();
        const windowBounds = childWindow.getBounds();
        const borderWidth = (windowBounds.width - contentBounds.width) / 2;
        const titlebarHeight =
          windowBounds.height - contentBounds.height - borderWidth;
        childWindow.webContents.send(
          IPC_EVENT.response_getChildWindowTitlebarHeight,
          {
            titlebarHeight,
            requestId,
          }
        );
      } catch (error) {
        console.log('getChildWindowTitlebarHeight错误');
        console.log(error);
        childWindow.webContents.send(
          IPC_EVENT.response_getChildWindowTitlebarHeight,
          {
            isErr: true,
            msg: '',
            requestId,
          }
        );
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.setWindowPosition,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.setWindowPosition}`, reqData);
      const { data } = reqData;
      const { x, y } = data;
      if (!win) return;
      try {
        if (winBounds) {
          // electron无边框窗口在Windows下拖拽导致窗口放大（Windows系统缩放不为100%时）
          // https://github.com/electron/electron/issues/20320
          // https://github.com/electron/electron/issues/10862
          win.setBounds(winBounds);
        }
        win.setPosition(x, y);
        win.webContents.send(IPC_EVENT.response_setWindowPosition, {});
      } catch (error) {
        console.log(error);
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.getWindowPosition,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.getWindowPosition}`, reqData);
      const { requestId } = reqData;
      const point = win?.getPosition();
      if (point) {
        win?.webContents.send(IPC_EVENT.response_getWindowPosition, {
          position: { x: point[0], y: point[1] },
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    IPC_EVENT.getScreenStream,
    async (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.getScreenStream}`, reqData);
      const { requestId } = reqData;
      try {
        const inputSources = await desktopCapturer.getSources({
          types: ['screen'],
        });
        const res: any[] = [];
        Object.keys(inputSources).forEach((key) => {
          const source = inputSources[key];
          if (!res.length) {
            res.push(source);
          }
        });
        win?.webContents.send(IPC_EVENT.response_getScreenStream, {
          isErr: false,
          msg: 'ok',
          stream: res[0],
          requestId,
        });
      } catch (error) {
        console.log('getScreenStream失败');
        console.log(error);
        win?.webContents.send(IPC_EVENT.response_getScreenStream, {
          isErr: true,
          msg: JSON.stringify(error),
          requestId,
        });
      }
    }
  );

  ipcMain.on(IPC_EVENT.getMainWindowId, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.getMainWindowId}`, reqData);
    const { requestId } = reqData;
    win?.webContents.send(IPC_EVENT.response_getMainWindowId, {
      id: win.id,
      requestId,
    });
  });

  ipcMain.on(
    IPC_EVENT.mainWindowSetAlwaysOnTop,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.mainWindowSetAlwaysOnTop}`, reqData);
      const { requestId, data } = reqData;
      const { flag } = data;
      win?.setAlwaysOnTop(flag);
      win?.webContents.send(IPC_EVENT.response_mainWindowSetAlwaysOnTop, {
        requestId,
      });
    }
  );

  ipcMain.on(IPC_EVENT.scaleFactor, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.scaleFactor}`, reqData);
    const { requestId } = reqData;
    const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
    win?.webContents.send(IPC_EVENT.response_scaleFactor, {
      scaleFactor,
      platform,
      requestId,
    });
  });

  ipcMain.on(IPC_EVENT.workAreaSize, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.workAreaSize}`, reqData);
    const { requestId } = reqData;
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win?.webContents.send(IPC_EVENT.response_workAreaSize, {
      width,
      height,
      requestId,
    });
  });

  ipcMain.on(
    IPC_EVENT.getPrimaryDisplaySize,
    (_event, reqData: IIpcRendererData) => {
      console.log(`electron收到${IPC_EVENT.getPrimaryDisplaySize}`, reqData);
      const { requestId } = reqData;
      const { width, height } = screen.getPrimaryDisplay().size;
      win?.webContents.send(IPC_EVENT.response_getPrimaryDisplaySize, {
        width,
        height,
        requestId,
      });
    }
  );

  ipcMain.on(IPC_EVENT.childWindowInit, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.childWindowInit}`, reqData);
    const { requestId, data } = reqData;
    const { id } = data;
    const childWindow = childWindowMap.get(Number(id));
    childWindow?.webContents.send(IPC_EVENT.response_childWindowInit, {
      requestId,
    });
  });

  ipcMain.on(IPC_EVENT.createWindow, (_event, reqData: IIpcRendererData) => {
    console.log(`electron收到${IPC_EVENT.createWindow}`, reqData);
    const { requestId, data } = reqData;
    const { width, height, route, query, x, y, useWorkAreaSize } = data;
    try {
      let w = width || windowNormalParams.width;
      let h = height || windowNormalParams.height;
      if (useWorkAreaSize) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        w = width;
        h = height;
      }
      const childWindow = new BrowserWindow({
        width: w,
        height: h,
        autoHideMenuBar: true,
        x: x || 0,
        y: y || 0,
        webPreferences: {
          devTools: true,
          // nodeIntegration: true, // 在网页中集成Node
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      childWindow.on('close', () => {
        childWindow?.webContents.send(IPC_EVENT.response_closeChildWindow, {
          windowId: `${childWindow.id}`,
          requestId,
        });
      });
      childWindow.on('closed', () => {
        // 在子窗口关闭时触发
        win?.webContents.send(IPC_EVENT.response_closeChildWindowed, {
          windowId: `${childWindow.id}`,
          requestId,
        });
      });
      childWindowMap.set(Number(childWindow.id), childWindow);
      let url = '';
      const params = `${(route ? route : '') as string}${handleUrlQuery({
        windowId: `${childWindow.id}`,
        ...query,
      })}`;
      if (platform === 'darwin') {
        console.log('运行在 macOS 上');
      } else if (platform === 'linux') {
        console.log('运行在 Linux 上');
      } else if (platform === 'win32') {
        console.log('运行在 Windows 上');
      } else {
        console.log(`未知的操作系统: ${platform}`);
      }
      if (process.env.VITE_DEV_SERVER_URL) {
        url = `${process.env.VITE_DEV_SERVER_URL as string}#/${params}`;
        childWindow.loadURL(url);
        // childWindow.webContents.openDevTools({ mode: 'detach' });
      } else {
        url = `${path.join(
          process.env.DIST as string,
          'index.html'
        )}#/${params}`;
        childWindow.loadFile(
          `${path.join(process.env.DIST as string, 'index.html')}`,
          {
            hash: route
              ? `${route as string}${handleUrlQuery({
                  windowId: `${childWindow.id}`,
                  ...query,
                })}`
              : undefined,
          }
        );
      }
      win?.webContents.send(IPC_EVENT.response_createWindow, {
        id: childWindow.id,
        url,
        platform,
        VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
        requestId,
      });
    } catch (error) {
      console.log('createWindow失败');
      console.log(error);
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL as string);
    // win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(process.env.DIST as string, 'index.html'));
  }
}

app.on('ready', () => {
  powerMonitor.on('suspend', () => {
    win?.webContents.send(IPC_EVENT.response_powerMonitorSuspend);
    childWindowMap.forEach((item) => {
      item.webContents.send(IPC_EVENT.response_powerMonitorSuspend);
    });
  });
  powerMonitor.on('resume', () => {
    win?.webContents.send(IPC_EVENT.response_powerMonitorResume);
    childWindowMap.forEach((item) => {
      item.webContents.send(IPC_EVENT.response_powerMonitorResume);
    });
  });
});
app.on('window-all-closed', () => {
  app.quit();
  win = null;
});

app.whenReady().then(createWindow);
