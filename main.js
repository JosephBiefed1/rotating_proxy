const puppeteer = require('puppeteer');
// const proxyChain = require('proxy-chain');
const fs = require('fs');
const readline = require('readline');

// Path to the text file
const filePath = 'proxies.txt';

// Function to process a single proxy
async function processProxy(proxy, index) {
  const proxyUrl = `http://${proxy}`;
  console.log(`Using proxy: ${proxyUrl}`);

  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [`--proxy-server=${proxyUrl}`],
    });

    const page = await browser.newPage();

    // Define the timeout in milliseconds (e.g., 30 seconds)
    const timeout = 30000;
    const timer = setTimeout(async () => {
      console.error(`Timeout: Closing browser for proxy ${proxyUrl}`);
      await browser.close();
    }, timeout);

    try {
      await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
      await page.screenshot({ path: `example-${index}.png` });
    } catch (error) {
      console.error(`Error navigating with proxy ${proxyUrl}:`, error);
    } finally {
      clearTimeout(timer);
      await browser.close();
    }
  } catch (error) {
    console.error(`Error with proxy ${proxyUrl}:`, error);
  }
}

// Function to read proxies from a file and process them
async function readProxiesAndProcess() {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const proxies = [];

  // Read each line and add to the proxies array
  for await (const line of rl) {
    proxies.push(line);
  }

  // Process each proxy
  for (let i = 0; i < proxies.length; i++) {
    await processProxy(proxies[i], i);
  }

  console.log('Finished processing all proxies');
}

// Start the process
readProxiesAndProcess();
