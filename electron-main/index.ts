import path from 'path';
import { platform } from 'process';

import { BrowserWindow, app, desktopCapturer, ipcMain, screen } from 'electron';

import { nutjsTs } from './types';

const nutjs: nutjsTs = require('@nut-tree/nut-js');

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
const windowNormalParams = { width: 800, height: 600 };

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
  ipcMain.on('childWindowClose', (_event, windowId) => {
    console.log('收到childWindowClose');
    try {
      const childWindow = childWindowMap.get(Number(windowId));
      childWindow?.close();
    } catch (error) {
      console.log('childWindowClose失败');
      console.log(error);
      win?.webContents.send('childWindowCloseRes', {
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('windowClose', () => {
    console.log('收到windowClose');
    try {
      win?.close();
    } catch (error) {
      console.log(error);
      win?.webContents.send('windowCloseRes', {
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('windowMinimize', () => {
    console.log('收到windowMinimize');
    try {
      win?.minimize();
    } catch (error) {
      console.log(error);
      win?.webContents.send('windowMinimizeRes', {
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('windowMaximize', () => {
    console.log('收到windowMaximize');
    try {
      win?.maximize();
    } catch (error) {
      console.log(error);
      win?.webContents.send('windowMaximizeRes', {
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('handleOpenDevTools', (_event, windowId) => {
    console.log('收到handleOpenDevTools');
    try {
      if (windowId) {
        const childWindow = childWindowMap.get(Number(windowId));
        childWindow?.webContents.openDevTools();
        childWindow?.webContents.send('handleOpenDevToolsRes', { msg: 'ok' });
      } else {
        win?.webContents.openDevTools();
        win?.webContents.send('handleOpenDevToolsRes', { msg: 'ok' });
      }
    } catch (error) {
      console.log(error);
      win?.webContents.send('handleOpenDevToolsRes', {
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('handleMoveScreenRightBottom', () => {
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
      });
    }
  });
  ipcMain.on('mouseScrollDown', async (_event, amount) => {
    console.log('收到mouseScrollDown');
    try {
      await nutjs.mouse.scrollDown(amount);
      win?.webContents.send('mouseScrollDownRes', {
        isErr: false,
        msg: { amount },
      });
    } catch (error) {
      win?.webContents.send('mouseScrollDownRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseScrollUp', async (_event, amount) => {
    console.log('收到mouseScrollUp');
    try {
      await nutjs.mouse.scrollUp(amount);
      win?.webContents.send('mouseScrollUpRes', {
        isErr: false,
        msg: { amount },
      });
    } catch (error) {
      win?.webContents.send('mouseScrollUpRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseScrollLeft', async (_event, amount) => {
    console.log('收到mouseScrollLeft');
    try {
      await nutjs.mouse.scrollLeft(amount);
      win?.webContents.send('mouseScrollLeftRes', {
        isErr: false,
        msg: { amount },
      });
    } catch (error) {
      win?.webContents.send('mouseScrollLeftRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseScrollRight', async (_event, amount) => {
    console.log('收到mouseScrollRight');
    try {
      await nutjs.mouse.scrollRight(amount);
      win?.webContents.send('mouseScrollRightRes', {
        isErr: false,
        msg: { amount },
      });
    } catch (error) {
      win?.webContents.send('mouseScrollRightRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseSetPosition', async (_event, x, y) => {
    console.log('收到mouseSetPosition', x, y);
    try {
      await nutjs.mouse.setPosition({ x, y });
      win?.webContents.send('mouseSetPositionRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseSetPositionRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseMove', (_event, x, y) => {
    console.log('收到mouseMove', x, y);
    try {
      // await nutjs.mouse.move([{ x, y }]);
      nutjs.mouse.move([{ x, y }]);
      win?.webContents.send('mouseMoveRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseMoveRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseDrag', async (_event, x, y) => {
    console.log('收到mouseDrag', x, y);
    try {
      await nutjs.mouse.drag([{ x, y }]);
      win?.webContents.send('mouseDragRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseDragRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('keyboardType', async (_event, key) => {
    console.log('收到keyboardType', key);
    try {
      await nutjs.keyboard.type(key);
      win?.webContents.send('keyboardTypeRes', {
        isErr: false,
        msg: { key },
      });
    } catch (error) {
      win?.webContents.send('keyboardTypeRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mousePressButtonLeft', async (_event, x, y) => {
    console.log('收到mousePressButtonLeft', x, y);
    try {
      await nutjs.mouse.pressButton(nutjs.Button.LEFT);
      win?.webContents.send('mousePressButtonLeftRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mousePressButtonLeftRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseReleaseButtonLeft', async (_event, x, y) => {
    console.log('收到mouseReleaseButtonLeft', x, y);
    try {
      await nutjs.mouse.releaseButton(nutjs.Button.LEFT);
      win?.webContents.send('mouseReleaseButtonLeftRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseReleaseButtonLeftRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseDoubleClick', async (_event, x, y) => {
    console.log('收到mouseDoubleClick', x, y);
    try {
      await nutjs.mouse.doubleClick(nutjs.Button.LEFT);
      win?.webContents.send('mouseDoubleClickRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseDoubleClickRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseLeftClick', async (_event, x, y) => {
    console.log('收到mouseLeftClick', x, y);
    try {
      await nutjs.mouse.click(nutjs.Button.LEFT);
      win?.webContents.send('mouseLeftClickRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseLeftClickRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('mouseRightClick', async (_event, x, y) => {
    console.log('收到mouseRightClick', x, y);
    try {
      await nutjs.mouse.click(nutjs.Button.RIGHT);
      win?.webContents.send('mouseRightClickRes', {
        isErr: false,
        msg: { x, y },
      });
    } catch (error) {
      win?.webContents.send('mouseRightClickRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });
  ipcMain.on('getMousePosition', async () => {
    console.log('收到getMousePosition');
    const point = await nutjs.mouse.getPosition();
    win?.webContents.send('getMousePositionRes', {
      point,
    });
  });
  ipcMain.on('setChildWindowBounds', (_event, windowId, width, height) => {
    console.log('收到setChildWindowBounds');
    const childWindow = childWindowMap.get(Number(windowId));
    if (!childWindow) return;
    try {
      childWindow.setBounds({ width, height });
      childWindow.webContents.send('setChildWindowBoundsRes', {
        width,
        height,
      });
    } catch (error) {
      console.log('setChildWindowBounds错误');
      console.log(error);
      childWindow.webContents.send('setChildWindowBoundsRes', {
        isErr: true,
        msg: '',
      });
    }
  });

  ipcMain.on('getChildWindowTitlebarHeight', (_event, windowId) => {
    console.log('收到getChildWindowTitlebarHeight');
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
      });
    } catch (error) {
      console.log('getChildWindowTitlebarHeight错误');
      console.log(error);
      childWindow.webContents.send('getChildWindowTitlebarHeightRes', {
        isErr: true,
        msg: '',
      });
    }
  });
  ipcMain.on('setWindowPosition', (_event, x, y) => {
    console.log('收到setWindowPosition');
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
      });
    } catch (error) {
      console.log(error);
    }
  });
  ipcMain.on('getWindowPosition', () => {
    console.log('收到getWindowPosition');
    const point = win?.getPosition();
    if (point) {
      win?.webContents.send('getWindowPositionRes', {
        position: { x: point[0], y: point[1] },
      });
    }
  });
  ipcMain.on('getScreenStream', async () => {
    try {
      console.log('收到getScreenStream');
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
      });
    } catch (error) {
      console.log('getScreenStream失败');
      console.log(error);
      win?.webContents.send('getScreenStreamRes', {
        isErr: true,
        msg: JSON.stringify(error),
      });
    }
  });

  ipcMain.on('getMainWindowId', (_event, data) => {
    console.log('electron收到getMainWindowId', data);
    win?.webContents.send('getMainWindowIdRes', { id: win.id });
  });
  ipcMain.on('mainWindowSetAlwaysOnTop', (_event, data) => {
    console.log('electron收到mainWindowSetAlwaysOnTop', data);
    win?.setAlwaysOnTop(data.data.flag);
  });

  ipcMain.on('workAreaSize', (_event, data) => {
    console.log('electron收到workAreaSize', data);
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    win?.webContents.send('workAreaSizeRes', {
      width,
      height,
    });
  });

  ipcMain.on('getWindowId', (_event, data) => {
    console.log('electron收到getWindowId', data);
  });

  ipcMain.on('childWindowInit', (_event, data) => {
    console.log('electron收到childWindowInit', data);
    const childWindow = childWindowMap.get(Number(data.data.id));
    childWindow?.webContents.send('childWindowInitRes', {});
  });

  ipcMain.on('createWindow', (_event, data) => {
    try {
      console.log('electron收到createWindow', data);
      let w = data.data.width || windowNormalParams.width;
      let h = data.data.height || windowNormalParams.height;
      if (data.data.useWorkAreaSize) {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        w = width;
        h = height;
      }
      const childWindow = new BrowserWindow({
        width: w,
        height: h,
        autoHideMenuBar: true,
        x: data.data.x || 0,
        y: data.data.y || 0,
        webPreferences: {
          devTools: true,
          // nodeIntegration: true, // 在网页中集成Node
          preload: path.join(__dirname, 'preload.js'),
        },
      });
      childWindow.on('close', () => {
        childWindow?.webContents.send('childWindowClose', {
          windowId: `${childWindow.id}`,
        });
      });
      childWindow.on('closed', () => {
        // 在子窗口关闭时触发
        win?.webContents.send('childWindowClosed', {
          windowId: `${childWindow.id}`,
        });
      });
      childWindowMap.set(Number(childWindow.id), childWindow);
      let url = '';
      const params = `${
        (data.data.route ? data.data.route : '') as string
      }${handleUrlQuery({
        windowId: `${childWindow.id}`,
        ...data.data.query,
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
        // childWindow.webContents.openDevTools();
      } else {
        url = `${path.join(
          process.env.DIST as string,
          'index.html'
        )}#/${params}`;
        childWindow.loadFile(
          `${path.join(process.env.DIST as string, 'index.html')}`,
          {
            hash: data.data.route
              ? `${data.data.route as string}${handleUrlQuery({
                  windowId: `${childWindow.id}`,
                  ...data.data.query,
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
      });
    } catch (error) {
      console.log('createWindow失败');
      console.log(error);
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL as string);
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(process.env.DIST as string, 'index.html'));
  }
}

app.on('window-all-closed', () => {
  app.quit();
  win = null;
});

app.whenReady().then(createWindow);
