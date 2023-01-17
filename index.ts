import {
  ConnectionContextBase,
  ConnectionConfig,
  TokenType,
  createSasTokenProvider
} from "@azure/core-amqp";

const dotenv = require('dotenv');
dotenv.config();

const isLocalServer = process.env.MESSAGE_QUEUE_CONNECTION_STRING!.indexOf("servicebus.windows.net") == -1;

if(isLocalServer) { 
  //Workaround for bypassing setting up a valid SSL on local
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

import { Sender, SenderOptions, EventContext, Message, Delivery } from "rhea-promise";

const connectionConfig = ConnectionConfig.create(process.env.MESSAGE_QUEUE_CONNECTION_STRING!, process.env.MESSAGE_QUEUE_NAME!);

const parameters = {
  config: connectionConfig,
  connectionProperties: {
      product: "MSJSClient",
      userAgent: "/js-core-amqp",
      version: "1.0.0"
  }
};

const connectionContext = ConnectionContextBase.create(parameters);

async function authenticate(audience: string): Promise<void> {
  await connectionContext.cbsSession.init();
  
  if(isLocalServer) {
      return;
  }

  const sharedKeyCredential = createSasTokenProvider({ sharedAccessKeyName: connectionConfig.sharedAccessKeyName, sharedAccessKey: connectionConfig.sharedAccessKey });
  const tokenObject = sharedKeyCredential.getToken(audience);
  await connectionContext.cbsSession.negotiateClaim(
      audience,
      tokenObject.token,
      TokenType.CbsTokenTypeSas
  );
}

async function main(): Promise<void> {
  await authenticate(`${connectionConfig.endpoint}${connectionConfig.entityPath}`);
  
  const senderName = "sender-1";
  const senderOptions: SenderOptions = {
      name: senderName,
      target: {
          address: `${connectionConfig.entityPath}`
      },
      onError: (context: EventContext) => {
          const senderError = context.sender && context.sender.error;
          if (senderError) {
              console.log(
                  "[%s] An error occurred for sender '%s': %O.",
                  connectionContext.connection.id,
                  senderName,
                  senderError
              );
          }
      },
      onSessionError: (context: EventContext) => {
          const sessionError = context.session && context.session.error;
          if (sessionError) {
              console.log(
                  "[%s] An error occurred for session of sender '%s': %O.",
                  connectionContext.connection.id,
                  senderName,
                  sessionError
              );
          }
      }
  };

  const sender: Sender = await connectionContext.connection.createSender(senderOptions);
  const message: Message = {
      body: "Hello World!!"
  };

  const delivery: Delivery = await sender.send(message);
  console.log("[%s] Delivery id: ", connectionContext.connection.id, delivery.id);

  await sender.close();
  await connectionContext.connection.close();
}

main().catch((err) => console.log(err));