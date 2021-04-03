// const puppeteer = require('puppeteer');
// const config = require('/config.js');
import puppeteer from 'puppeteer'
import config from '../config.js'
import fs from 'fs'

const HREF_Mobile_Index_Link = 'https://detail.zol.com.cn/cell_phone_index/subcate57_list_1.html';
const ID_Search_Input = '#keyword';
// 总体href
const Details_Link_Selector = '#wrapper>div.main>div.list-box>div.series.clearfix>div.intro>h4>a';
// 三种配置li的path
const List_Link_Selector = '#wrapper > div.main > div.list-box > div.series.clearfix > div.intro > ul > li'
// const mobile = 'oppo find x3';

export const openSearchPage = async (mobile) => {
  const browser = await puppeteer.launch({
    headless: true
  });

  const indexPage = await browser.newPage();
  await indexPage.goto(HREF_Mobile_Index_Link);

  try {
    await indexPage.waitForSelector(ID_Search_Input);
  } catch (error) {
    console.log('error: ', error.message);
    console.log('页面已崩溃');
    browser.close();
    return {
      ok: false,
      msg: '无法打开首页',
      data: null
    };
  }

  // await indexPage.evaluate((selector) => document.querySelector(selector).value = "", ID_Search_Input)
  await indexPage.$eval(ID_Search_Input, elm => elm.value = '');
  await indexPage.type(ID_Search_Input, mobile, {
    delay: 0
  });

  await indexPage.keyboard.press('Enter');

  console.log('正在打开搜索页...');
  const searchPage = indexPage;

  try {
    // 获取标签文字
    await searchPage.waitForSelector(Details_Link_Selector);
    // const aTagText = await searchPage.evaluate((selector) => document.querySelector(selector).innerText, Details_Link_Selector);
    const aTagText = await indexPage.$eval(Details_Link_Selector, elm => elm.innerText);

    // a标签文字和手机名对比
    const hasMobile = aTagText.toLowerCase().includes(mobile.toLowerCase());

    if (!hasMobile) {
      console.log('has没有这款手机')
      return 'has没有这款手机';
    }
  } catch (error) {
    console.log('error: ', error.message);
    browser.close();
    return {
      ok: false,
      msg: '没有这款手机',
      data: null
    };
  }
  let links = await indexPage.$$eval(List_Link_Selector, (lis, mobile) =>
    lis.map(item => {
      const a = item.querySelector('a');
      const hasMobile = a.innerText.toLowerCase().includes(mobile.toLowerCase());
      if (hasMobile) {
        return {
          title: a.innerText,
          url: a.href
        };
      }
    }), mobile
  );
  links = links.filter(item => item)
  console.log('links: ', links);
  fs.writeFile('./data/links.json', JSON.stringify(links), {}, (err) => {
    if (err) {
      return console.log('写入失败', err.message);
    }
    console.log('写入成功');
  });
  browser.close();
}

openSearchPage('oppo find x3');