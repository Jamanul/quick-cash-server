const express = require('express')
const app = express()
const port = 5000 || process.env.PORT

app.get('/', (req, res) => {
    res.send('Hello from job task')
  })

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })