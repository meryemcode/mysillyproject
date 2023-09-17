const { json } = require('express');
const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
//blocing syn way
// const textin = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textin);
// const textOut = `this is what we about the avocado : ${textin}.\nCreated on ${Date.now()} `;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("file written!");
// non-blocking asyn way
// fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
//   fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
//     console.log(data);
//   });
//   console.log(data);
// });
// console.log("will read file");
//service
const replaceTemplate = (temp, product) => {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replace(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%NURITION%}/g, product.nutrients);
  output = output.replace(/{%QUANTITE%}/g, product.quantity);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);
  output = output.replace(/{%ID%}/g, product.id);
  if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
  return output;
};

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  //Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'content-type': 'text/html',
    });
    const cardHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardHtml);
    res.end(output);

    //product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
    //API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);
  }
  //Not found
  else {
    res.writeHead(404, {
      'content-type': 'text/html',
      'my-own-header': 'hello world',
    });
    res.end('<h1>Page not found</h1>');
  }
});
server.listen(8000, '127.0.0.1', () => {
  console.log('listening to request pn port 8000');
});
