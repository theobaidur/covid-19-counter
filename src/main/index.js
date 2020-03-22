'use strict'

import { app, BrowserWindow, Menu } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const axios = require('axios');
const cheerio = require('cheerio');

const template = [{
  label: 'App',
  submenu: [
    {
        label: 'Toggle Top',
        click: async()=>{
            if(win){
              win.setAlwaysOnTop(!win.isAlwaysOnTop());
            }
        }
    },
    {
        label: 'Close',
        click: ()=>{
            if(win){
                win.close();
            }
        }
    },
    {
        label: 'Open Console',
        click: ()=>{
            if(win){
              win.webContents.openDevTools();
            }
        }
    }
  ]
}];

const isDevelopment = process.env.NODE_ENV !== 'production'
let win;

const scrap = async ()=>{
  const {data, error} = await axios('https://www.worldometers.info/coronavirus').catch(error=>({error}));
  if(!error){
      const $ = cheerio.load(data);
      const counters = $('.maincounter-number > span');
      const result = {};
      counters.each(function(i){
          let prop = 'cases';
          if(i === 1){
              prop = 'deaths';
          }
          if(i === 2){
              prop = 'recovered';
          }
          result[prop] = +($(this).text() || '0').replace(/[^\d.-]/g, '');
      });
      if(win){
          win.webContents.send('store-data', result);
      }
  }
  setTimeout(()=> scrap(), 6 * 1000);
}

function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true}, width: 250, height: 300})
  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL(formatUrl({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    win = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  scrap();
  return window
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    win = createMainWindow()
  }
})

app.on('ready', () => {
  win = createMainWindow()
})
