const puppeteer = require('puppeteer');

// const HREF_Mobile_Index_Link = 'https://mobile.zol.com.cn/';
const HREF_Mobile_Index_Link = 'https://detail.zol.com.cn/cell_phone_index/subcate57_list_1.html';
// const ID_Search_Input = '#J_keywords';
const ID_Search_Input = '#keyword';
// const Details_Link_Selector = 'body > div.wrapper.clearfix > div.main > ul > li:nth-child(4) > div > div > div.brand-detail-info > h3 > a';
const Details_Link_Selector = '#wrapper>div.main>div.list-box>div.series.clearfix>div.intro>h4>a';
const mobile = 'oppo find x3';
const headlessMode = false;


const start = async () => {
  console.log('正在打开浏览器...');
  const browser = await puppeteer.launch({
    headless: headlessMode
  });
  const browserWSEndpoint = browser.wsEndpoint();
  const indexPage = await browser.newPage();
  console.log('正在打开主页...');
  await indexPage.goto(HREF_Mobile_Index_Link);
  try {
    await indexPage.waitForSelector(ID_Search_Input);
  } catch (error) {
    console.log('页面已崩溃');
    browser.close();
    return '页面已崩溃';
  }
  await indexPage.evaluate((selector) => document.querySelector(selector).value = "", ID_Search_Input)
  await indexPage.type(ID_Search_Input, mobile, {
    delay: 0
  });
  await indexPage.keyboard.press('Enter');
  console.log('正在打开搜索页...');
  const searchPage = indexPage;
  try {
    await searchPage.waitForSelector(Details_Link_Selector);
    const hasMobile = await searchPage.evaluate((selector, mobileName) => document.querySelector(selector).innerText.includes(mobileName), Details_Link_Selector, mobile);
    if (!hasMobile) {
      console.log('has没有这款手机')
      return 'has没有这款手机';
    }
  } catch (error) {
    console.log('error: ', error);
    console.log('没有这款手机')
    // browser.close();
    return '没有这款手机';
  }
  const detailsPagePromise = new Promise(res =>
    browser.on('targetcreated',
      target => res(target.page())
    )
  );
  await searchPage.click(Details_Link_Selector);
  searchPage.close();
  console.log('正在打开详情页...');
  const detailsPage = await detailsPagePromise;
  await detailsPage.waitForSelector('.price-type');
  const price = await detailsPage.evaluate((selector) => document.querySelector(selector).innerText, '.price-type');
  console.log('price: ', price);
  await browser.close()
  console.log('浏览器关闭');



}


start();
