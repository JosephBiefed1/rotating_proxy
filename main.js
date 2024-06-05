const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

// const proxyChain = require('proxy-chain');
const fs = require('fs');

const readline = require('readline');
const { executablePath } = require('puppeteer');

// Path to the text file
const filePath = 'proxies.txt';

// Function to process a single proxy
async function processProxy(proxy, index) {
  const proxyUrl = `http://${proxy}`;
  console.log(`Using proxy: ${proxyUrl}`);
  const executable_path = ""
  const usr_directory = ""
  
  try {
    const browser = await puppeteer.launch({
      headless: false, executablePath: executable_path,
      // userDataDir: usr_directory, 
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
      await page.goto('https://bot.sannysoft.com/', { waitUntil: 'networkidle2' });
      await page.screenshot({ path: `example-${index}.png` });
      
      // If page.goto succeeds, clear the timer and return true
      clearTimeout(timer);
      await browser.close();
      return true;
    } catch (error) {
      console.error(`Error navigating with proxy ${proxyUrl}:`, error);
      clearTimeout(timer);
      await browser.close();
      return false;
    }
  } catch (error) {
    console.error(`Error with proxy ${proxyUrl}:`, error);
    return false;
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

  // Process each proxy until a successful one is found
  for (let i = 0; i < proxies.length; i++) {
    const success = await processProxy(proxies[i], i);
    if (success) {
      console.log(`Successful proxy found: ${proxies[i]}`);
      break; // Stop checking other proxies
    }
  }

  console.log('Finished processing proxies');
}

// Start the process
readProxiesAndProcess();
