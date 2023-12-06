export const coordinateStringToArray = (txt: string) =>
  txt
    .slice(1, -1)
    .split(',')
    // eslint-disable-next-line @typescript-eslint/no-shadow
    .map(txt => parseFloat(txt.replace('{', '').replace('}', '')));

export async function wait(ms: number) {
  await new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
