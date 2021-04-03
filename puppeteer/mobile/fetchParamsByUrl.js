// const puppeteer = require('puppeteer');
// const config = require('/config.js');
import puppeteer from 'puppeteer'
import config from '../config.js'
import fs from 'fs'

const mobile_link = 'https://detail.zol.com.cn/1357/1356802/param.shtml';

export const getParamsByUrl = async (url, filename) => {
  const browser = await puppeteer.launch({
    headless: true
  });

  const page = await browser.newPage();
  await page.goto(url);

  try {
    await page.waitForSelector('table');
  } catch (error) {
    console.log('error: ', error.message);
    console.log('页面已崩溃');
    browser.close();
    return {
      ok: false,
      msg: '无法页面',
      data: null
    };
  }

  const result = [];

  /**
   * 基本参数
   */
  const paramNames = await page.$$eval('label.name', elems => elems.map(
    node => node.innerText
  ));
  const paramValues = await page.$$eval('label.name + .product-link', elems => elems.map(
    node => node.innerText
  ));
  const params = [];
  paramNames.forEach((name, index) => {
    params.push({
      name,
      value: paramValues[index]
    })
  });
  result.push({
    categoryName: '基础信息',
    params
  })


  /**
   * 详细参数
   */
  const allParams = [];
  // 找到所有的table
  const tables = await page.$$('table');

  for (let table of tables) {
    // 找到所有的参数名
    const categoryName = await table.$eval('.hd', elem => elem.innerText);

    // 找到所有的参数名
    const paramNames = await table.$$eval('[id^=newPmName_]', elems => elems.map(
      node => node.innerText
    ));

    // 找到所有的参数值 
    const paramValues = await table.$$eval('[id^=newPmVal_]', elems => elems.map(
      node => node.innerText
    ));

    // 组合为json
    const params = [];
    paramNames.forEach((name, index) => {
      params.push({
        name,
        value: paramValues[index]
      })
    });
    allParams.push({
      categoryName,
      params
    })
  }

  // 加入结果集
  result.push({
    categoryName: '详细信息',
    params: allParams
  })

  console.log('result: ', result);

  fs.writeFile(`./data/${filename}.json`, JSON.stringify(result), {}, (err) => {
    if (err) {
      return console.log('写入失败', err.message);
    }
    console.log('写入成功');
  });

  browser.close();
}

getParamsByUrl('https://detail.zol.com.cn/1327/1326868/param.shtml', 'one_plus_9_Pro');