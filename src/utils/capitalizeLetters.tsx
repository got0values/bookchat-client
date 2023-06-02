export function capitalizeLetters(str: string) {
  let str2 = str.split(" ");
  for (let i = 0, x = str2.length; i < x; i++) {
      str2[i] = str2[i][0].toUpperCase() + str2[i].substr(1);
  }
  return str2.join(" ");
}