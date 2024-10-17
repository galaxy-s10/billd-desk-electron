import path from 'path';
import { platform } from 'process';

import {
  BrowserWindow,
  app,
  desktopCapturer,
  ipcMain,
  powerMonitor,
  powerSaveBlocker,
  screen,
} from 'electron';

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
const windowNormalParams = { width: 800, height: 500 };

function createWindow() {
  win = new BrowserWindow({
    width: windowNormalParams.width,
    height: windowNormalParams.height,
    autoHideMenuBar: true,
    webPreferences: {
      // devTools: true,
      // nodeIntegration: true, // 在网页中集成Node
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
  });
  winBounds = win.getBounds();
  ipcMain.on('powerSaveBlockerStart', (_event, { requestId }) => {
    console.log('收到powerSaveBlockerStart', { requestId });
    try {
      powerSaveBlocker.start('prevent-display-sleep');
      win?.webContents.send('powerSaveBlockerStartRes', {
        msg: 'ok',
        requestId,
      });
    } catch (error) {
      console.log('powerSaveBlockerStart失败');
      console.log(error);
    }
  });
  ipcMain.on('childWindowClose', (_event, { requestId, windowId }) => {
    console.log('收到childWindowClose', { requestId, windowId });
    try {
      const childWindow = childWindowMap.get(Number(windowId));
      childWindow?.close();
    } catch (error) {
      console.log('childWindowClose失败');
      console.log(error);
      win?.webContents.send('childWindowCloseRes', {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('windowClose', (_event, { requestId }) => {
    console.log('收到windowClose', { requestId });
    try {
      win?.close();
    } catch (error) {
      console.log(error);
      win?.webContents.send('windowCloseRes', {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('windowMinimize', (_event, { requestId }) => {
    console.log('收到windowMinimize', { requestId });
    try {
      win?.minimize();
    } catch (error) {
      console.log(error);
      win?.webContents.send('windowMinimizeRes', {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('windowMaximize', (_event, { requestId }) => {
    console.log('收到windowMaximize', { requestId });
    try {
      win?.maximize();
    } catch (error) {
      console.log(error);
      win?.webContents.send('windowMaximizeRes', {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('handleOpenDevTools', (_event, { requestId, windowId }) => {
    console.log('收到handleOpenDevTools', { requestId, windowId });
    try {
      if (windowId) {
        const childWindow = childWindowMap.get(Number(windowId));
        childWindow?.webContents.openDevTools({ mode: 'detach' });
        childWindow?.webContents.send('handleOpenDevToolsRes', {
          requestId,
          msg: 'ok',
        });
      } else {
        win?.webContents.openDevTools({ mode: 'detach' });
        win?.webContents.send('handleOpenDevToolsRes', {
          requestId,
          msg: 'ok',
        });
      }
    } catch (error) {
      console.log(error);
      win?.webContents.send('handleOpenDevToolsRes', {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('handleMoveScreenRightBottom', (_event, { requestId }) => {
    console.log('收到handleMoveScreenRightBottom');
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
      win.webContents.send('handleMoveScreenRightBottomRes', {
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseScrollDown', async (_event, { requestId, amount }) => {
    console.log('收到mouseScrollDown', { requestId, amount });
    try {
      await nutjs.mouse.scrollDown(amount);
      win?.webContents.send('mouseScrollDownRes', {
        isErr: false,
        msg: { amount },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseScrollDownRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseScrollUp', async (_event, { requestId, amount }) => {
    console.log('收到mouseScrollUp', { requestId, amount });
    try {
      await nutjs.mouse.scrollUp(amount);
      win?.webContents.send('mouseScrollUpRes', {
        isErr: false,
        msg: { amount },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseScrollUpRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseScrollLeft', async (_event, { requestId, amount }) => {
    console.log('收到mouseScrollLeft', { requestId, amount });
    try {
      await nutjs.mouse.scrollLeft(amount);
      win?.webContents.send('mouseScrollLeftRes', {
        isErr: false,
        msg: { amount },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseScrollLeftRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseScrollRight', async (_event, { requestId, amount }) => {
    console.log('收到mouseScrollRight', { requestId, amount });
    try {
      await nutjs.mouse.scrollRight(amount);
      win?.webContents.send('mouseScrollRightRes', {
        isErr: false,
        msg: { amount },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseScrollRightRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseSetPosition', async (_event, { requestId, x, y }) => {
    console.log('收到mouseSetPosition', { requestId, x, y });
    try {
      await nutjs.mouse.setPosition({ x, y });
      win?.webContents.send('mouseSetPositionRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseSetPositionRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseMove', async (_event, { requestId, x, y }) => {
    console.log('收到mouseMove', { requestId, x, y });
    try {
      // await nutjs.mouse.move([{ x, y }]);
      nutjs.mouse.move([{ x, y }]);
      win?.webContents.send('mouseMoveRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseMoveRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseDrag', async (_event, { requestId, x, y }) => {
    console.log('收到mouseDrag', { requestId, x, y });
    try {
      await nutjs.mouse.drag([{ x, y }]);
      win?.webContents.send('mouseDragRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseDragRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('keyboardType', async (_event, { requestId, key }) => {
    console.log('收到keyboardType', { requestId, key });
    try {
      await nutjs.keyboard.type(key);
      win?.webContents.send('keyboardTypeRes', {
        isErr: false,
        msg: { key, requestId },
      });
    } catch (error) {
      win?.webContents.send('keyboardTypeRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mousePressButtonLeft', async (_event, { requestId, x, y }) => {
    console.log('收到mousePressButtonLeft', { requestId, x, y });
    try {
      await nutjs.mouse.pressButton(nutjs.Button.LEFT);
      win?.webContents.send('mousePressButtonLeftRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mousePressButtonLeftRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseReleaseButtonLeft', async (_event, { requestId, x, y }) => {
    console.log('收到mouseReleaseButtonLeft', { requestId, x, y });
    try {
      await nutjs.mouse.releaseButton(nutjs.Button.LEFT);
      win?.webContents.send('mouseReleaseButtonLeftRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseReleaseButtonLeftRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseDoubleClick', async (_event, { requestId, x, y }) => {
    console.log('收到mouseDoubleClick', { requestId, x, y });
    try {
      await nutjs.mouse.doubleClick(nutjs.Button.LEFT);
      win?.webContents.send('mouseDoubleClickRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseDoubleClickRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseLeftClick', async (_event, { requestId, x, y }) => {
    console.log('收到mouseLeftClick', { requestId, x, y });
    try {
      await nutjs.mouse.click(nutjs.Button.LEFT);
      win?.webContents.send('mouseLeftClickRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseLeftClickRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('mouseRightClick', async (_event, { requestId, x, y }) => {
    console.log('收到mouseRightClick', { requestId, x, y });
    try {
      await nutjs.mouse.click(nutjs.Button.RIGHT);
      win?.webContents.send('mouseRightClickRes', {
        isErr: false,
        msg: { x, y },
        requestId,
      });
    } catch (error) {
      win?.webContents.send('mouseRightClickRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });
  ipcMain.on('getMousePosition', async (_event, { requestId }) => {
    console.log('收到getMousePosition', { requestId });
    const point = await nutjs.mouse.getPosition();
    win?.webContents.send('getMousePositionRes', {
      point,
      requestId,
    });
  });
  ipcMain.on(
    'setChildWindowBounds',
    (_event, { requestId, windowId, width, height }) => {
      console.log('收到setChildWindowBounds', {
        requestId,
        windowId,
        width,
        height,
      });
      const childWindow = childWindowMap.get(Number(windowId));
      if (!childWindow) return;
      try {
        childWindow.setBounds({ width, height });
        childWindow.webContents.send('setChildWindowBoundsRes', {
          width,
          height,
          requestId,
        });
      } catch (error) {
        console.log('setChildWindowBounds错误');
        console.log(error);
        childWindow.webContents.send('setChildWindowBoundsRes', {
          isErr: true,
          msg: '',
          requestId,
        });
      }
    }
  );

  ipcMain.on(
    'getChildWindowTitlebarHeight',
    (_event, { requestId, windowId }) => {
      console.log('收到getChildWindowTitlebarHeight', { requestId, windowId });
      const childWindow = childWindowMap.get(Number(windowId));
      if (!childWindow) return;
      try {
        const contentBounds = childWindow.getContentBounds();
        const windowBounds = childWindow.getBounds();
        const borderWidth = (windowBounds.width - contentBounds.width) / 2;
        const titlebarHeight =
          windowBounds.height - contentBounds.height - borderWidth;
        childWindow.webContents.send('getChildWindowTitlebarHeightRes', {
          titlebarHeight,
          requestId,
        });
      } catch (error) {
        console.log('getChildWindowTitlebarHeight错误');
        console.log(error);
        childWindow.webContents.send('getChildWindowTitlebarHeightRes', {
          isErr: true,
          msg: '',
          requestId,
        });
      }
    }
  );
  ipcMain.on('setWindowPosition', (_event, { requestId, x, y }) => {
    console.log('收到setWindowPosition', { requestId, x, y });
    if (!win) return;
    try {
      if (winBounds) {
        // electron无边框窗口在Windows下拖拽导致窗口放大（Windows系统缩放不为100%时）
        // https://github.com/electron/electron/issues/20320
        // https://github.com/electron/electron/issues/10862
        win.setBounds(winBounds);
      }
      win.setPosition(x, y);
      win.webContents.send('setWindowPositionRes', {
        x,
        y,
        winBounds,
        requestId,
      });
    } catch (error) {
      console.log(error);
    }
  });
  ipcMain.on('getWindowPosition', (_event, { requestId }) => {
    console.log('收到getWindowPosition', { requestId });
    const point = win?.getPosition();
    if (point) {
      win?.webContents.send('getWindowPositionRes', {
        position: { x: point[0], y: point[1] },
        requestId,
      });
    }
  });
  ipcMain.on('getScreenStream', async (_event, { requestId }) => {
    try {
      console.log('收到getScreenStream', { requestId });
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
      win?.webContents.send('getScreenStreamRes', {
        isErr: false,
        msg: 'ok',
        stream: res[0],
        requestId,
      });
    } catch (error) {
      console.log('getScreenStream失败');
      console.log(error);
      win?.webContents.send('getScreenStreamRes', {
        isErr: true,
        msg: JSON.stringify(error),
        requestId,
      });
    }
  });

  ipcMain.on('getMainWindowId', (_event, { requestId, type }) => {
    console.log('electron收到getMainWindowId', { requestId, type });
    win?.webContents.send('getMainWindowIdRes', { id: win.id, requestId });
  });

  ipcMain.on(
    'mainWindowSetAlwaysOnTop',
    (_event, { requestId, type, data }) => {
      console.log('electron收到mainWindowSetAlwaysOnTop', {
        requestId,
        type,
        data,
      });
      win?.setAlwaysOnTop(data.flag);
    }
  );

  ipcMain.on('workAreaSize', (_event, { requestId }) => {
    console.log('electron收到workAreaSize', { requestId });
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win?.webContents.send('workAreaSizeRes', {
      width,
      height,
      requestId,
    });
  });

  ipcMain.on('getPrimaryDisplaySize', (_event, { requestId }) => {
    console.log('electron收到getPrimaryDisplaySize', { requestId });
    const { width, height } = screen.getPrimaryDisplay().size;
    win?.webContents.send('getPrimaryDisplaySizeRes', {
      width,
      height,
      requestId,
    });
  });

  ipcMain.on('childWindowInit', (_event, { requestId, type, data }) => {
    console.log('electron收到childWindowInit', { requestId, type, data });
    const childWindow = childWindowMap.get(Number(data.id));
    childWindow?.webContents.send('childWindowInitRes', { requestId });
  });

  ipcMain.on('createWindow', (_event, { requestId, type, data }) => {
    try {
      console.log('electron收到createWindow', { requestId, type, data });
      let w = data.width || windowNormalParams.width;
      let h = data.height || windowNormalParams.height;
      if (data.useWorkAreaSize) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        w = width;
        h = height;
      }
      const childWindow = new BrowserWindow({
        width: w,
        height: h,
        autoHideMenuBar: true,
        x: data.x || 0,
        y: data.y || 0,
        webPreferences: {
          devTools: true,
          // nodeIntegration: true, // 在网页中集成Node
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      childWindow.on('close', () => {
        childWindow?.webContents.send('childWindowClose', {
          windowId: `${childWindow.id}`,
          requestId,
        });
      });
      childWindow.on('closed', () => {
        // 在子窗口关闭时触发
        win?.webContents.send('childWindowClosed', {
          windowId: `${childWindow.id}`,
          requestId,
        });
      });
      childWindowMap.set(Number(childWindow.id), childWindow);
      let url = '';
      const params = `${
        (data.route ? data.route : '') as string
      }${handleUrlQuery({
        windowId: `${childWindow.id}`,
        ...data.query,
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
        childWindow.webContents.openDevTools({ mode: 'detach' });
      } else {
        url = `${path.join(
          process.env.DIST as string,
          'index.html'
        )}#/${params}`;
        childWindow.loadFile(
          `${path.join(process.env.DIST as string, 'index.html')}`,
          {
            hash: data.route
              ? `${data.route as string}${handleUrlQuery({
                  windowId: `${childWindow.id}`,
                  ...data.query,
                })}`
              : undefined,
          }
        );
      }
      win?.webContents.send('createWindowRes', {
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
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(process.env.DIST as string, 'index.html'));
  }
}

app.on('ready', () => {
  powerMonitor.on('suspend', () => {
    win?.webContents.send('powerMonitor-suspend');
    childWindowMap.forEach((item) => {
      item.webContents.send('powerMonitor-suspend');
    });
  });
  powerMonitor.on('resume', () => {
    win?.webContents.send('powerMonitor-resume');
    childWindowMap.forEach((item) => {
      item.webContents.send('powerMonitor-resume');
    });
  });
});
app.on('window-all-closed', () => {
  app.quit();
  win = null;
});

app.whenReady().then(createWindow);
