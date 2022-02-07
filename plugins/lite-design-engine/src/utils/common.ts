export const coordinateStringToArray = (txt: string) => {
  return txt.slice(1, -1).split(',').map(txt => parseFloat(txt.replace('{', '').replace('}', '')));
}

export async function wait(ms: number) {
  await new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
