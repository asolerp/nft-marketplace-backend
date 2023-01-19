import { Web3Repository } from './Web3Repository'

export class Web3Events extends Web3Repository {
  public subscribedEvents: any = {}

  public subscribeLogEvent(eventName: string, callback: any) {
    const eventJsonInterface = this.contract()._jsonInterface.find(
      (o: any) => o.name === eventName && o.type === 'event'
    )

    const subscription = this.wsClient().eth.subscribe(
      'logs',
      {
        address: this.contract().options.address,
        topics: [eventJsonInterface.signature],
      },
      (error: any, result: any) => {
        if (!error) {
          const eventObj = this.client().eth.abi.decodeLog(
            eventJsonInterface.inputs,
            result.data,
            result.topics.slice(1)
          )
          callback(eventObj)
        }
      }
    )

    this.subscribedEvents[eventName] = subscription

    console.log(
      `Subscribed to event '${eventName}' of contract '${
        this.contract().options.address
      }' `
    )
  }

  public unsubscribeEvent(eventName: string) {
    this.subscribedEvents[eventName].unsubscribe(function (
      error: any,
      success: any
    ) {
      if (success) console.log('Successfully unsubscribed!')
    })
  }
}
