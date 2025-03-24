import puppeteer from 'puppeteer';
import readline from 'readline';

async function scrapeBooksToScrape() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://books.toscrape.com');

  const bookData = await page.evaluate(() => {
    const books = document.querySelectorAll('article.product_pod');
    return Array.from(books).map(book => {
      const title = book.querySelector('h3 a').getAttribute('title');
      const price = book.querySelector('.price_color').textContent.trim();
      const imgUrl = book.querySelector('img').getAttribute('src');
      return {
        title,
        price,
        imgUrl: 'http://books.toscrape.com/' + imgUrl,
      };
    });
  });

  await browser.close();
  return bookData;
}

async function scrapeFilterToScrape() {
  const books = await scrapeBooksToScrape();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Inserta el mínimo precio: ', (pricemin) => {
    rl.question('Inserta el máximo precio: ', (pricemax) => {
      let rangoMin = parseFloat(pricemin.replace('£', ''));
      let rangoMax = parseFloat(pricemax.replace('£', ''));

      console.log(`El rango de precios es: [${rangoMin}, ${rangoMax}]`);

      let filteredBooks = books.filter(book => {
        let bookPrice = parseFloat(book.price.replace('£', ''));
        return bookPrice >= rangoMin && bookPrice <= rangoMax;
      });

      filteredBooks.sort((a, b) => {
        let priceA = parseFloat(a.price.replace('£', ''));
        let priceB = parseFloat(b.price.replace('£', ''));
        return priceA - priceB;
      });

      console.log('Libros dentro del rango de precios:');
      filteredBooks.forEach(book => {
        console.log(`Título: ${book.title}`);
        console.log(`Precio: ${book.price}`);
        console.log(`URL de la imagen: ${book.imgUrl}`);
        console.log('-----------------------------');
      });

      rl.close();
    });
  });
}

scrapeFilterToScrape();
