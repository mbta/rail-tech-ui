import JSDOMEnvironment from "jest-environment-jsdom";

export default class FixJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // react-router makes internal use of the Request type, which is unavailable in JSDOM
    this.global.Request = Request;
    this.global.Response = Response;

    // structuredClone is unavailable in JSDOM
    this.global.structuredClone = structuredClone;
  }
}
