# poc-amqp
POC to showcase using @azure/core-amqp to communicate with both Azure SB and Active MQ using 1-0 protocol

# Build
1. Install dependencies via: `npm install`
2. Compile the code using: `tsc index.js`

# Run
1. Rename `.env.sample` file to `.env`
2. Edit `.env` file and configure the correct ActiveMQ or Azure SB connection string parameters and the queue name (queue has to already exist)
3. Run with `node index.js`

# Result
1. A `Hello World !!` message will be queued to the configured `MESSAGE_QUEUE_NAME`
