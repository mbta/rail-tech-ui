import JSDOMEnvironment from "jest-environment-jsdom";

export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // structuredClone is unavailable in JSDOM
    this.global.structuredClone = structuredClone;
  }
}
