import { connect } from "../amqp.ts";

const env = Deno.env();
const connection = await connect(
  { heartbeatInterval: 0, loglevel: env.DEBUG ? "debug" : "none" }
);

const channel1 = await connection.channel();
const channel2 = await connection.channel();

await channel1.queue.declare({ queue: "foo.queue" });
await channel1.basic.consume({ queue: "foo.queue" }, (args, props, data) => {
  console.log("Received message");
  console.log(args, props, data);
  console.log("Args", JSON.stringify(args));
  console.log("Properties", JSON.stringify(props));
  console.log("Message", new TextDecoder().decode(data));
  channel1.basic.ack({ deliveryTag: args.deliveryTag });
});

await channel2.basic.publish(
  { routingKey: "foo.queue" },
  { contentType: "application/json" },
  new TextEncoder().encode(JSON.stringify({ foo: "bar" }))
);

// await channel1.close();

// setTimeout(() => connection.close(), 2000);
// await connection.close();