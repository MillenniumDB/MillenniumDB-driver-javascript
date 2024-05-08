# MillenniumDB driver for JavaScript (Browser and Node.js)

## Installation - npm

```bash
npm i millenniumdb-driver
```

## Installation - browser

Make the MillenniumDB object available globally with:

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

First you must establish a connection with the database:

```js
// Create a driver instance
const url = '<URL for the MillenniumDB server>';
const driver = MillenniumDB.driver(url);

// Acquire a session
const session = driver.session();

// Execute a query
const query = 'MATCH (?from)-[:?type]->(?to) RETURN * LIMIT 10';
const result = session.run(query);
```

Then for consuming the results you can use any of the available APIs. They should never be mixed because it would generate undefined behavior on the result consumption. The preferred way to consume the results is using the Subscribe API, as it is the only that does not hold all the results in memory, it just streams it to an observer object provided by the user.

It is important to mention that the session **must be closed when your operations are done**.

### Subscribe API

```js
result.subscribe({
  onKeys: (keys) => {
    console.log('The columns are:', keys);
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

#### Promise-based API with async/await syntax

```js
const keys = await result.keys();
const records = await result.records();
const summary = await result.summary();
```

#### Promise-based API with `.then()/.catch()/.finally()` syntax

```js
// catch/finally are ommited for brevity

result.keys().then((keys) => {
    console.log('The columns are:', keys);
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
