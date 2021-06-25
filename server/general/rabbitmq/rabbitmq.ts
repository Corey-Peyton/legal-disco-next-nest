import amqp from 'amqplib';

export class RabbitMQ {
  static async sendToQueue(queue: string, data: any) {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const documentProcessQueue = queue;

    channel.assertQueue(documentProcessQueue, {
      durable: false,
      exclusive: false,
      autoDelete: false,
      arguments: null,
    });

    channel.sendToQueue(
      documentProcessQueue,
      Buffer.from(JSON.stringify(data)),
    );
  }
}
