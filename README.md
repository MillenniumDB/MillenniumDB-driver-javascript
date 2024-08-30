# MillenniumDB driver for JavaScript (Browser and Node.js)

* [GitHub repository](https://github.com/MillenniumDB/MillenniumDB-driver-javascript/)
* [NPM package](https://www.npmjs.com/package/millenniumdb-driver/)
* [API documentation](https://millenniumdb.github.io/MillenniumDB-driver-javascript/)

## Installation - npm

```bash
npm install millenniumdb-driver
```

Then you can require the MillenniumDB object module:

```js
var MillenniumDB = require('millenniumdb-driver');
```

## Installation - browser

Make the `MillenniumDB` object available globally with:

```html
<!-- Direct reference non-minified -->
<script src="/lib/browser/millenniumdb-driver.js"></script>
<!-- Direct reference minified -->
<script src="/lib/browser/millenniumdb-driver.min.js"></script>

<!-- unpkg CDN non-minified -->
<script src="https://unpkg.com/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.js"></script>
<!-- unpkg CDN minified -->
<script src="https://unpkg.com/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.min.js"></script>

<!-- jsDelivr CDN non-minified -->
<script src="https://cdn.jsdelivr.net/npm/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.js"></script>
<!-- jsDelivr CDN minified -->
<script src="https://cdn.jsdelivr.net/npm/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.min.js"></script>
```

Or use the ESM versions

```html
<script type="module">
  // Direct reference non-minified
  import MillenniumDB from '/lib/browser/millenniumdb-driver.esm.js';
  // Direct reference minified
  import MillenniumDB from '/lib/browser/millenniumdb-driver.esm.min.js';
  // unpkg CDN non-minified
  import MillenniumDB from 'https://unpkg.com/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.esm.js';
  // unpkg CDN minified
  import MillenniumDB from 'https://unpkg.com/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.esm.min.js';
  // jsDelivr CDN non-minified
  import MillenniumDB from 'https://cdn.jsdelivr.net/npm/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.esm.js';
  // jsDelivr CDN minified
  import MillenniumDB from 'https://cdn.jsdelivr.net/npm/millenniumdb-driver@latest/lib/browser/millenniumdb-driver.esm.min.js';
</script>
```

## Usage

### Creating a Driver instance

First you must create a `Driver` instance:

```js
const url = '<URL for the MillenniumDB server>';
const driver = MillenniumDB.driver(url)
```

When you are done with the driver, you should close it before exiting the application.

```js
driver.close();
```

Usually you would like to have a single `Driver` instance in your application.

### Acquiring a Session

For sending queries to the MillenniumDB server, you must acquire a session instance:

```js
const session = driver.session();
```

Then you can send queries through your session

```js
const query = 'MATCH (?from)-[:?type]->(?to) RETURN * LIMIT 10';
const result = session.run(query);
```

### Consuming results

The alternatives for consuming results must never be mixed because it would generate undefined behavior on your client and/or server. It is important to mention that the session **must be closed when your operations are done**.

#### Streaming API

This is the preferred way to consume the results, as it is the only that does not hold all the results in memory, it just streams it to an observer object provided by the user. The observer must implement the following methods:

* `onVariables`: First event trigerred, just once. It will return the variable names of the query.
* `onRecord`: Subsequent events triggered for each record available in the query result. It will return a `Record` object.
* `onSuccess`: Trigerred at the end of the query execution. It will return a summary for the query. No more events are triggered afterwards.
* `onError`: Trigerred if an error occurs during the query execution. It will return an error. No more events are triggered afterwards. This could even happen before receiving the `onVariables` event.

```js
result.subscribe({
  onVariables: (variables) => {
    console.log('The variables are:', variables);
  },
  onRecord: (record) => {
    // Do something with each record
  },
  onSuccess: (summary) => {
    console.log('Summary:', summary);
    session.close();
  },
  onError: (error) => {
    console.error('Error:', error);
    session.close();
  },
});
```

### Promise-based API with async/await syntax

```js
const variables = await result.variables();
const records = await result.records();
const summary = await result.summary();
```

### Promise-based API with `.then()`, `.catch()`, `.finally()` syntax

```js
// catch/finally are ommited for brevity

result.variables().then((variables) => {
    console.log('The variables are:', variables);
});

result.records().then((records) => {
    for (const record of records) {
        // Do something with each record
    }
});

result.summary().then((summary) => {
    console.log('Summary', summary);
});
```
