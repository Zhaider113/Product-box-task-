const http = require('http');
const url = require('url');
const request = require('request');
const async = require('async');
const RSVP = require('rsvp');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Ensure there's at least one address in the query.
    if (query.address) {
        const addresses = Array.isArray(query.address) ? query.address : [query.address];

        if (path === '/I/want/title') {
            handleRequest(addresses, getAddressTitleCallback, res);
        } else if (path === '/I/want/title2') {
            handleRequestAsyncMap(addresses, res);
        } else if (path === '/I/want/title3') {
            handleRequestPromises(addresses, res);
        } else {
            console.log(query)
            notFound(res, query.address);
        }
    } else {
        notFound(res, query.address);
    }
});

function handleRequest(addresses, fetchTitleMethod, res) {
    const titles = [];
    let completedRequests = 0;

    addresses.forEach((address) => {
        fetchTitleMethod(address, (error, title) => {
            titles.push(title || { address, title: 'NO RESPONSE' });
            completedRequests++;
            if (completedRequests === addresses.length) {
                sendResponse(res, titles);
            }
        });
    });
}

function handleRequestAsyncMap(addresses, res) {
    async.map(addresses, getAddressTitleAsync, (error, results) => {
        sendResponse(res, results);
    });
}

function handleRequestPromises(addresses, res) {
    const promises = addresses.map(address => getTitlePromise(address));
    RSVP.allSettled(promises).then(results => {
        const titles = results.map(result => {
            if (result.state === 'fulfilled') {
                return result.value;
            }
            return { address: result.reason.address, title: 'NO RESPONSE' };
        });
        sendResponse(res, titles);
    });
}

function getAddressTitleCallback(address, callback) {
    // Ensure address includes protocol
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        address = 'http://' + address;
    }

    request(address, (error, response, body) => {
        if (error) {
            callback(error, null);
            return;
        }
        if (response.statusCode !== 200) {
            callback(new Error('Failed to load page, status code: ' + response.statusCode), null);
            return;
        }

        const match = body.match(/<title>(.*?)<\/title>/);
        if (match && match[1]) {
            callback(null, { address, title: match[1] });
        } else {
            callback(new Error('Title not found'), null);
        }
    });
}


function getAddressTitleAsync(address, callback) {
    // Ensure address includes protocol
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        address = 'http://' + address;
    }

    request(address, (error, response, body) => {
        if (error) {
            callback(null, { address, title: 'NO RESPONSE' }); // Notice the null error for async continuation
            return;
        }
        if (response.statusCode !== 200) {
            callback(null, { address, title: 'NO RESPONSE' });
            return;
        }

        const match = body.match(/<title>(.*?)<\/title>/);
        if (match && match[1]) {
            callback(null, { address, title: match[1] });
        } else {
            callback(null, { address, title: 'NO RESPONSE' });
        }
    });
}


function getTitlePromise(address) {
    if (!address.startsWith('http://') && !address.startsWith('https://')) {
        address = 'https://' + address;
    }
    return new RSVP.Promise((resolve, reject) => {
        request(address, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                reject(error);
                return;
            }

            const titleMatch = body.match(/<title>(.*?)<\/title>/i);

            if (titleMatch && titleMatch[1]) {

                resolve({ address, title: titleMatch[1].trim() });
            } else {
                resolve('Title not found');
            }
        });
    });
}

function sendResponse(res, titles) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body>');
    res.write('<h1>Following are the titles of given websites:</h1>');
    res.write('<ul>');
    titles.forEach((title) => {
        res.write(`<li>${title.address} - "${title.title}"</li>`);
    });
    res.write('</ul>');
    res.write('</body>');
    res.write('</html>');
    res.end();
}

function notFound(res, query) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write('<html>');
    res.write('<head></head>');
    res.write('<body>');
    res.write('<h1>Following are the titles of given websites:</h1>');
    res.write('<ul>');
    if(query === undefined){
        res.write(`<li>No Address - "NO RESPONSE"</li>`);
    }else{
        res.write(`<li>${query} - "NO RESPONSE"</li>`);
    }
    res.write('</ul>');
    res.write('</body>');
    res.write('</html>');
    res.end();
}

const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
