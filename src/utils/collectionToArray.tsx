

export default function collectionToArray(dataObject: any[], keyName: string) {
    return dataObject.flatMap(obj=>obj[keyName])
  }