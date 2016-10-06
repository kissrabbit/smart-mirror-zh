/* 全局 __dirname */
/* 全局 process */
const electron = require('electron')
// Child Process for keyword spotter
const {spawn} = require('child_process')
// 控制应用的生命周期模块
const app = electron.app
// 创建原生浏览窗口模块
const BrowserWindow = electron.BrowserWindow
// 禁止显示器休眠
const powerSaveBlocker = electron.powerSaveBlocker
powerSaveBlocker.start('prevent-display-sleep')

// 以开发者模式启动
const DevelopmentMode = process.argv[2] == "dev";

// 加载魔镜的配置文件
var config;
try {
    config = require(__dirname + "/config.js");
} catch (e) {
    var error = "未知的错误"

    if (typeof e.code != 'undefined' && e.code == 'MODULE_NOT_FOUND') {
        error = "'config.js' 没有找到。 \n" +
            "请确保你已经在魔镜的根目录下创建了'config.js'文件 ";
    } else if (typeof e.message != 'undefined') {
        error = "语法错误。 \n" +
            "你的配置文件看上去有些问题：" + e.message
    }

    console.log("配置文件有误: ", error)
    app.quit()
}

// 确保窗口对象有一个全局的引用，否则当JavaScript对象被垃圾回收时窗口将会被自动地关闭。
let mainWindow

function createWindow() {

    // 如果有第二块显示屏的话，在第二块显示屏上显示。
    var atomScreen = electron.screen;
    var displays = atomScreen.getAllDisplays();
    var externalDisplay = null;
    for (var i in displays) {
        if (displays[i].bounds.x > 0 || displays[i].bounds.y > 0) {
            externalDisplay = displays[i];
            break;
        }
    }

    var browserWindowOptions = {
        width: 800,
        height: 600,
        icon: 'favicon.ico',
        kiosk: true,
        autoHideMenuBar: true,
        darkTheme: true
    };
    if (externalDisplay) {
        browserWindowOptions.x = externalDisplay.bounds.x + 50
        browserWindowOptions.y = externalDisplay.bounds.y + 50
    }

    // 创建浏览窗口
    mainWindow = new BrowserWindow(browserWindowOptions)

    // 加载应用index.html。
    mainWindow.loadURL('file://' + __dirname + '/index.html')

    // 如果用"npm start dev"运行打开开发者工具。
    if (DevelopmentMode) {
        mainWindow.webContents.openDevTools();
    }

    // 在关闭窗口时调用方法
    mainWindow.on('closed', function () {
        // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
        // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
        mainWindow = null
    })
}

// 获取关键词识别配置
if (typeof config.speech == 'undefined') {
    config.speech = {}
}
var modelFile = config.speech.model || "smart_mirror.pmdl"
var kwsSensitivity = config.speech.sensitivity || 0.5

// 初始化关键词识别
var kwsProcess = spawn('python', ['./speech/kws.py', modelFile, kwsSensitivity], {detached: false})
// 通过python脚本处理信息
kwsProcess.stderr.on('data', function (data) {
    var message = data.toString()
    if (message.startsWith('INFO')) {
        // 当一个关键字被识别时，调用语音服务。
        mainWindow.webContents.send('keyword-spotted', true)
    } else {
        console.error(message)
    }
});
kwsProcess.stdout.on('data', function (data) {
    console.log(data.toString())
});

// 当Electron完成初始化并且已经创建了浏览器窗口，则该方法将会被调用。
// 有些API只能在该事件发生后才能被使用。
app.on('ready', createWindow);

// 当所有的窗口被关闭后退出应用
app.on('window-all-closed', function () {
    app.quit()
});

// 无论引用是怎么退出的，我们都应该退出自己
app.on('will-quit', function () {
    kwsProcess.kill()
});
