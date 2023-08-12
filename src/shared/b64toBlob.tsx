
export const b64toBlob = async (b64Data: string, contentType='image/png', sliceSize=512) => {
  var url = b64Data;

  var blob = await fetch(url)
    .then(res=>{
      return res.blob()
    })
    .then((res)=>{
      return res
    })

  return blob;

  // const byteCharacters = atob(b64Data);
  // const byteArrays = [];

  // for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
  //   const slice = byteCharacters.slice(offset, offset + sliceSize);

  //   const byteNumbers = new Array(slice.length);
  //   for (let i = 0; i < slice.length; i++) {
  //     byteNumbers[i] = slice.charCodeAt(i);
  //   }

  //   const byteArray = new Uint8Array(byteNumbers);
  //   byteArrays.push(byteArray);
  // }

  // const blob = new Blob(byteArrays, {type: contentType});
  // return blob;
}